import { app } from "./app";
import { env } from "./config/env";
import { startEmailJobWorker } from "./workers/emailJob.worker";

app.listen(env.PORT, () => {
  console.log(`Backend rodando em http://localhost:${env.PORT}`);
});

startEmailJobWorker();
