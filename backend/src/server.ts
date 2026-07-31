import app from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════╗
  ║   🌟 Ambition Academy API Server  ║
  ║   Running on port ${PORT}            ║
  ║   ENV: ${(process.env.NODE_ENV || 'development').padEnd(11)}          ║
  ╚═══════════════════════════════════╝
  `);
});

export default app;
