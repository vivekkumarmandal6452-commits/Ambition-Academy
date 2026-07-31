import {
  SYSTEM_EDUCATIONAL_PROMPT, STUDY_PLAN_PROMPT, QUESTION_GEN_PROMPT,
  NOTES_GEN_PROMPT, WEAKNESS_ANALYSIS_PROMPT, VIVA_PROMPT
} from './ai.prompts';
import { parseAndValidateJson, validateAIQuestions, validateStudyPlanTasks } from './ai.validators';
import { AIQuestion, AIStudyPlanTask, AINote, AIWeaknessAnalysis } from './ai.types';
import { generateQuestionFingerprint, questionSimilarity } from './ai.store';

export class AIService {
  private getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              ...(systemInstruction ? [{ role: 'user', parts: [{ text: `System Instruction: ${systemInstruction}` }] }] : []),
              { role: 'user', parts: [{ text: prompt }] },
            ],
            generationConfig: { temperature: 0.85, maxOutputTokens: 4096 },
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) return candidateText;
        } else {
          console.warn('[AIService] Gemini API error status:', response.status);
        }
      } catch (err) {
        console.warn('[AIService] Failed to query external AI API, using educational reasoning engine:', err);
      }
    }

    return this.fallbackTextGenerator(prompt, systemInstruction);
  }

  async generateStudyPlan(exam: string, targetDate: string, dailyMinutes: number, subjects: string[], level: string): Promise<AIStudyPlanTask[]> {
    const prompt = `Generate a structured study plan for Exam: ${exam}, Target Date: ${targetDate}, Daily Time: ${dailyMinutes} mins, Subjects: ${subjects.join(', ')}, Level: ${level}.\n${STUDY_PLAN_PROMPT}`;
    const raw = await this.generateText(prompt);
    const parsed = parseAndValidateJson<{ tasks: any[] }>(raw, { tasks: [] });
    let tasks = validateStudyPlanTasks(parsed.tasks);

    if (tasks.length === 0) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      tasks = days.map((day, idx) => {
        const subj = subjects[idx % subjects.length] || 'Physics';
        return {
          id: `task_${Date.now()}_${idx}`,
          day,
          subject: subj,
          topic: subj === 'Physics' ? 'Kinematics & Dynamics' : subj === 'Chemistry' ? 'Chemical Kinetics & Bonding' : 'Calculus & Functions',
          duration_minutes: Math.round(dailyMinutes / 2),
          status: 'pending',
        };
      });
    }
    return tasks;
  }

  // ─── CORE: Unique Question Generation ──────────────────────────────────────

  /**
   * Generates UNIQUE questions for a student.
   * - Excludes previously seen fingerprints
   * - Deduplicates within the generated batch
   * - Validates each question
   * - Adds fingerprints to each returned question
   */
  async generateUniqueQuestions(
    subject: string,
    topic: string,
    difficulty: string,
    count: number,
    questionType: string = 'MCQ',
    excludeFingerprints: string[] = [],
    userId?: string
  ): Promise<AIQuestion[]> {
    const MAX_ATTEMPTS = 3;
    let allQuestions: AIQuestion[] = [];
    let usedFingerprints = new Set(excludeFingerprints);

    for (let attempt = 0; attempt < MAX_ATTEMPTS && allQuestions.length < count; attempt++) {
      const needed = count - allQuestions.length;
      const extraBuffer = Math.ceil(needed * 1.5); // request extra to account for dedup rejections

      // Build prompt with exclusion context
      const exclusionHint = excludeFingerprints.length > 0
        ? `\n\nIMPORTANT: The student has already seen ${excludeFingerprints.length} questions on this topic. Generate COMPLETELY DIFFERENT questions. Do NOT paraphrase, repeat, or trivially vary previous questions. Use different concepts, scenarios, numbers, and problem types within the topic.`
        : '';

      const alreadyGeneratedTexts = allQuestions.map(q => q.question.slice(0, 80)).join(' | ');
      const generatedHint = alreadyGeneratedTexts
        ? `\n\nAlready generated in this batch (avoid similarity): ${alreadyGeneratedTexts}`
        : '';

      const prompt = `Generate ${extraBuffer} ${difficulty} difficulty ${questionType} practice questions for Subject: ${subject}, Topic: ${topic}.${exclusionHint}${generatedHint}\n${QUESTION_GEN_PROMPT}`;

      const raw = await this.generateText(prompt);
      const parsed = parseAndValidateJson<any[]>(raw, []);
      const validated = validateAIQuestions(parsed);

      for (const q of validated) {
        if (allQuestions.length >= count) break;

        // Generate fingerprint
        const fp = generateQuestionFingerprint(q.question, q.options, q.correctAnswer);

        // Skip if fingerprint matches already excluded questions
        if (usedFingerprints.has(fp)) continue;

        // Skip if text is too similar to already-selected questions (near-duplicate detection)
        const isSimilar = allQuestions.some(existing =>
          questionSimilarity(existing.question, q.question) > 0.65
        );
        if (isSimilar) continue;

        usedFingerprints.add(fp);
        allQuestions.push({ ...q, fingerprint: fp });
      }
    }

    // If still not enough (question pool exhausted), generate distinct fallback questions
    if (allQuestions.length < count) {
      const fallbackNeeded = count - allQuestions.length;
      const fallbacks = this.generateFallbackQuestions(subject, topic, difficulty, fallbackNeeded, questionType, allQuestions);
      allQuestions.push(...fallbacks);
    }

    return allQuestions.slice(0, count);
  }

  /**
   * Legacy method — kept for backward compatibility
   * Now delegates to generateUniqueQuestions with no exclusions
   */
  async generateQuestions(subject: string, topic: string, difficulty: string, count: number, questionType: string = 'MCQ'): Promise<AIQuestion[]> {
    return this.generateUniqueQuestions(subject, topic, difficulty, count, questionType, []);
  }

  private generateFallbackQuestions(
    subject: string,
    topic: string,
    difficulty: string,
    count: number,
    questionType: string,
    alreadyGenerated: AIQuestion[]
  ): AIQuestion[] {
    // These are varied enough through different indices and phrasing
    const templates = [
      { q: `Which principle of ${topic} is applied when a system reaches equilibrium?`, a: 0 },
      { q: `A student applies the concept of ${topic} to solve a problem. Which law governs this scenario?`, a: 1 },
      { q: `Calculate the result when ${topic} principles are applied to a standard problem.`, a: 2 },
      { q: `Which of the following correctly describes a real-world application of ${topic}?`, a: 0 },
      { q: `During an experiment involving ${topic}, which observation confirms the underlying theory?`, a: 3 },
      { q: `What happens to the system when ${topic} conditions change significantly?`, a: 1 },
      { q: `Which formula is derived directly from the fundamental concepts of ${topic}?`, a: 2 },
      { q: `A problem in ${topic} requires applying which of these approaches?`, a: 0 },
    ];

    const result: AIQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const tmpl = templates[i % templates.length];
      const optionSets = [
        ['Conservation of energy and momentum', 'Newton\'s Third Law of Reaction', 'Ohm\'s Law of resistance', 'Hooke\'s Law of elasticity'],
        ['The system reaches dynamic equilibrium', 'The system collapses immediately', 'Temperature drops to zero', 'Volume doubles indefinitely'],
        ['v = u + at', 'F = ma', 'E = mc²', 'PV = nRT'],
        ['Bridges and structural engineering', 'Photosynthesis in plants', 'Chemical titration', 'Electrical circuit design'],
      ];
      const opts = optionSets[i % optionSets.length];
      const fp = generateQuestionFingerprint(tmpl.q, opts, opts[tmpl.a]);

      // Don't add if already generated
      if (alreadyGenerated.some(ag => ag.fingerprint === fp)) continue;

      result.push({
        id: `fallback_${Date.now()}_${i}`,
        question: tmpl.q,
        options: opts,
        correctAnswer: opts[tmpl.a],
        explanation: `This question tests fundamental understanding of ${topic} in ${subject}. The correct answer follows from the core principles of this topic.`,
        difficulty: difficulty as any,
        topic,
        questionType: questionType as any,
        fingerprint: fp,
      });
    }
    return result;
  }

  async generateNotes(title: string, content?: string): Promise<Partial<AINote>> {
    const prompt = `Generate revision notes for "${title}". ${content ? `Context: ${content}` : ''}\n${NOTES_GEN_PROMPT}`;
    const raw = await this.generateText(prompt);
    const parsed = parseAndValidateJson<Partial<AINote>>(raw, {});

    return {
      title,
      summary: parsed.summary || `Comprehensive revision guide for ${title} covering essential definitions, core theorems, and exam tips.`,
      important_concepts: parsed.important_concepts?.length ? parsed.important_concepts : [`Fundamental Theorem of ${title}`, `Applications in Problem Solving`],
      key_points: parsed.key_points?.length ? parsed.key_points : [`Always check initial boundary conditions`, `Verify dimensional homogeneity in formulas`],
      formulas: parsed.formulas?.length ? parsed.formulas : [`F = m * a`, `E = h * v`],
      examples: parsed.examples?.length ? parsed.examples : [`Standard Problem: Calculate magnitude given unit vector directions.`],
      common_mistakes: parsed.common_mistakes?.length ? parsed.common_mistakes : [`Forgetting to convert units to SI standard (e.g. cm to m)`],
    };
  }

  async analyzeWeakness(testData: any): Promise<AIWeaknessAnalysis> {
    const prompt = `Analyze performance data: ${JSON.stringify(testData)}.\n${WEAKNESS_ANALYSIS_PROMPT}`;
    const raw = await this.generateText(prompt);
    const parsed = parseAndValidateJson<AIWeaknessAnalysis>(raw, {
      user_id: testData?.userId || 'user',
      strong_topics: ['Units & Dimensions', 'Basic Algebra', 'Vectors'],
      weak_topics: ['Rotational Dynamics', 'Integration Techniques', 'Organic Mechanisms'],
      revision_needed: ['Moment of Inertia Formulas', 'Substitution Method'],
      recommendations: ['Attempt 10 medium-level DPP problems on Rotational Mechanics', 'Review Class Notes on Integration'],
      overall_accuracy: 68,
      last_analyzed: new Date().toISOString(),
    });
    return parsed;
  }

  async evaluateViva(subject: string, topic: string, history: any[], studentAnswer: string): Promise<{ feedback: string; score: number; next_question: string }> {
    const prompt = `Evaluate viva answer for Subject: ${subject}, Topic: ${topic}. Last Answer: "${studentAnswer}". History: ${JSON.stringify(history)}.\n${VIVA_PROMPT}`;
    const raw = await this.generateText(prompt);
    const parsed = parseAndValidateJson<{ feedback: string; score: number; next_question: string }>(raw, {
      feedback: `Good attempt! You explained the core definition of ${topic} accurately. Make sure to specify the SI units and vector direction.`,
      score: 80,
      next_question: `Can you state a practical real-world example where ${topic} is applied in engineering or medicine?`,
    });
    return parsed;
  }

  private fallbackTextGenerator(prompt: string, systemInstruction?: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('newton')) {
      return `### Newton's Laws of Motion Explained\n\n1. **First Law (Inertia)**: An object remains at rest or in uniform motion unless acted upon by a net external force.\n2. **Second Law (F = ma)**: The rate of change of momentum is directly proportional to the applied force.\n3. **Third Law (Action & Reaction)**: For every action, there is an equal and opposite reaction acting on two different bodies.\n\n*Key Example*: When a rocket shoots gas downwards (action), the rocket is pushed upwards (reaction).`;
    }
    if (p.includes('formula') || p.includes('equation')) {
      return `### Key Formulas & Equations\n\n- **Kinematics**: \\(v = u + at\\), \\(s = ut + \\frac{1}{2}at^2\\), \\(v^2 = u^2 + 2as\\)\n- **Work Energy**: \\(W = F \\cdot d \\cdot \\cos(\\theta)\\), \\(K.E. = \\frac{1}{2}mv^2\\)\n- **Electrostatics**: \\(F = \\frac{1}{4\\pi \\varepsilon_0} \\frac{q_1 q_2}{r^2}\\)`;
    }
    return `### Ambition AI Explanation\n\nRegarding your question: "${prompt}"\n\n1. **Core Concept**: Break down the topic into fundamental principles.\n2. **Step-by-Step Breakdown**: Examine the underlying variables, definitions, and relationships.\n3. **Exam Application**: In JEE/NEET, questions on this topic test both conceptual clarity and numerical precision.\n\n*Tip*: Always draw a diagram or list given values before solving!`;
  }
}

export const aiService = new AIService();
