// メール通知（Resend API・任意）
// RESEND_API_KEY と EMAIL_FROM が未設定の場合は何もしない（既存動作を維持）
import type { ProjectMemberRole } from "@icrps/contracts";
import type { WorkerEnv } from "./env.js";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(message: EmailMessage, env: WorkerEnv): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.EMAIL_FROM;
  if (!apiKey || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text
      }),
      signal: AbortSignal.timeout(15000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function emailEnabled(env: WorkerEnv): boolean {
  return !!env.RESEND_API_KEY && !!env.EMAIL_FROM;
}

const ROLE_LABEL: Record<ProjectMemberRole, string> = {
  viewer: "閲覧（viewer）",
  editor: "編集（editor）",
  admin: "管理（admin）"
};

export function buildInvitationEmail(input: {
  projectTitle: string;
  role: ProjectMemberRole;
  appUrl: string;
  invitedEmail: string;
}): EmailMessage {
  return {
    to: input.invitedEmail,
    subject: `[ICRPS] プロジェクト共有の招待: ${input.projectTitle}`,
    text: [
      `プロジェクト「${input.projectTitle}」に招待されました。`,
      `あなたのロール: ${ROLE_LABEL[input.role]}`,
      "",
      `ICRPS にログインすると、プロジェクト一覧に表示されます。`,
      `URL: ${input.appUrl}`,
      "",
      "※ このメールはシステムからの自動送信です。"
    ].join("\n")
  };
}

export function buildTeamInvitationEmail(input: {
  teamName: string;
  role: ProjectMemberRole;
  appUrl: string;
  invitedEmail: string;
}): EmailMessage {
  return {
    to: input.invitedEmail,
    subject: `[ICRPS] チーム共有の招待: ${input.teamName}`,
    text: [
      `チーム「${input.teamName}」に招待されました。`,
      `あなたのロール: ${ROLE_LABEL[input.role]}`,
      "",
      `ICRPS にログインすると、チーム所属のプロジェクトにアクセスできます。`,
      `URL: ${input.appUrl}`,
      "",
      "※ このメールはシステムからの自動送信です。"
    ].join("\n")
  };
}

export function buildPasswordResetEmail(input: { resetUrl: string; appUrl: string; email: string }): EmailMessage {
  return {
    to: input.email,
    subject: "[ICRPS] パスワードリセット",
    text: [
      "パスワードリセットのリクエストを受け付けました。",
      "以下のリンクから新しいパスワードを設定してください（24時間有効）。",
      "",
      input.resetUrl,
      "",
      "心当たりがない場合は、このメールを無視してください。",
      `URL: ${input.appUrl}`
    ].join("\n")
  };
}

export function buildMagicLinkEmail(input: { loginUrl: string; appUrl: string; email: string }): EmailMessage {
  return {
    to: input.email,
    subject: "[ICRPS] ログインリンク",
    text: [
      "ICRPS へのログインリンクをお送りします（15分有効）。",
      "",
      input.loginUrl,
      "",
      "このリンクは一度しか使用できません。",
      `URL: ${input.appUrl}`
    ].join("\n")
  };
}
