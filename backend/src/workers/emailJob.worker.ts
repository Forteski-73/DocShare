import * as emailJobService from "../services/emailJob.service";
import * as emailService from "../services/email.service";
import { EMAIL_JOB_TYPE } from "../services/emailJob.service";

const POLL_INTERVAL_MS = 15_000;
const BATCH_SIZE = 10;

let running = false;

async function processJob(job: Awaited<ReturnType<typeof emailJobService.claimDueJobs>>[number]) {
  try {
    const payload = job.payload as Record<string, unknown>;

    if (job.type === EMAIL_JOB_TYPE.APPROVAL_REQUEST) {
      await emailService.sendApprovalRequestEmail(payload.to as string, {
        documentTitle: payload.documentTitle as string,
        typeLabel: payload.typeLabel as string,
        requesterName: payload.requesterName as string,
        requesterNote: (payload.requesterNote as string | null) ?? null,
        link: payload.link as string,
      });
    } else if (job.type === EMAIL_JOB_TYPE.APPROVAL_DECISION) {
      await emailService.sendApprovalDecisionEmail(payload.to as string, {
        documentTitle: payload.documentTitle as string,
        typeLabel: payload.typeLabel as string,
        approved: payload.approved as boolean,
        approverName: payload.approverName as string,
        approverNote: (payload.approverNote as string | null) ?? null,
        link: payload.link as string,
      });
    } else {
      throw new Error(`Tipo de job de e-mail desconhecido: ${job.type}`);
    }

    await emailJobService.markSent(job.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[EMAIL_JOB] Falha ao processar job ${job.id} (${job.type}): ${message}`);
    await emailJobService.markFailed(job.id, job.attempts, message);
  }
}

async function tick() {
  if (running) return;
  running = true;
  try {
    const jobs = await emailJobService.claimDueJobs(BATCH_SIZE);
    for (const job of jobs) {
      await processJob(job);
    }
  } catch (err) {
    console.error("[EMAIL_JOB] Erro ao buscar jobs pendentes:", err);
  } finally {
    running = false;
  }
}

export function startEmailJobWorker() {
  setInterval(() => {
    void tick();
  }, POLL_INTERVAL_MS);
  console.log(`[EMAIL_JOB] Worker de e-mail iniciado (poll a cada ${POLL_INTERVAL_MS / 1000}s)`);
}
