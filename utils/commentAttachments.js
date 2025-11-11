import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { all, get, run } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const COMMENT_ATTACHMENT_UPLOAD_DIR = path.join(
  __dirname,
  "..",
  "public",
  "uploads",
  "comments",
);

export function ensureCommentAttachmentDir() {
  return fs.mkdir(COMMENT_ATTACHMENT_UPLOAD_DIR, { recursive: true });
}

function normalizeAttachmentPath(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\\/g, "/").replace(/^[\\/]+/, "");
}

function buildCommentAttachmentUrl(relativePath) {
  if (!relativePath) {
    return null;
  }
  return `/public/${relativePath}`;
}

export async function purgeCommentAttachments(commentSnowflakeId) {
  if (!commentSnowflakeId) {
    return;
  }

  const attachments = await all(
    `SELECT file_path FROM comment_attachments WHERE comment_snowflake_id=?`,
    [commentSnowflakeId],
  );

  if (Array.isArray(attachments) && attachments.length) {
    await Promise.all(
      attachments.map(async ({ file_path }) => {
        const storedName = path.basename(file_path || "");
        if (!storedName) {
          return;
        }
        const absolutePath = path.join(COMMENT_ATTACHMENT_UPLOAD_DIR, storedName);
        try {
          await fs.unlink(absolutePath);
        } catch (error) {
          if (error?.code !== "ENOENT") {
            console.warn("Impossible de supprimer une pièce jointe de commentaire", {
              absolutePath,
              error,
            });
          }
        }
      }),
    );
  }

  await run("DELETE FROM comment_attachments WHERE comment_snowflake_id=?", [
    commentSnowflakeId,
  ]);
}

export async function listCommentAttachments() {
  const rows = await all(
    `SELECT ca.snowflake_id,
            ca.comment_snowflake_id,
            ca.file_path,
            ca.mime_type,
            ca.file_size,
            ca.original_name,
            ca.created_at,
            c.author,
            c.status,
            c.page_id,
            p.slug_id,
            p.title
       FROM comment_attachments ca
  LEFT JOIN comments c ON c.snowflake_id = ca.comment_snowflake_id
  LEFT JOIN pages p ON p.id = c.page_id
  ORDER BY ca.created_at DESC`,
  );

  return rows.map((row) => {
    const relativePath = normalizeAttachmentPath(row.file_path);
    const filename = relativePath ? path.basename(relativePath) : "";
    const originalName =
      typeof row.original_name === "string" && row.original_name
        ? row.original_name
        : filename || "Pièce jointe";
    const parsedSize = Number.parseInt(row.file_size, 10);
    const parsedPageId = Number.parseInt(row.page_id, 10);

    return {
      id: row.snowflake_id,
      commentId: row.comment_snowflake_id,
      commentAuthor: row.author || "",
      commentStatus: row.status || "",
      pageId: Number.isNaN(parsedPageId) ? null : parsedPageId,
      pageSlug: row.slug_id || "",
      pageTitle: row.title || "",
      relativePath,
      filename,
      url: buildCommentAttachmentUrl(relativePath),
      mimeType: row.mime_type || "",
      size: Number.isNaN(parsedSize) ? 0 : parsedSize,
      originalName,
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : null,
      isImage: /^image\/[^\s]+$/i.test(row.mime_type || ""),
    };
  });
}

export async function removeCommentAttachment(snowflakeId) {
  if (!snowflakeId) {
    return false;
  }

  const row = await get(
    "SELECT file_path FROM comment_attachments WHERE snowflake_id=?",
    [snowflakeId],
  );
  const relativePath = normalizeAttachmentPath(row?.file_path || "");
  const filename = relativePath ? path.basename(relativePath) : "";
  if (filename) {
    const targetPath = path.join(COMMENT_ATTACHMENT_UPLOAD_DIR, filename);
    try {
      await fs.unlink(targetPath);
    } catch (err) {
      if (err?.code !== "ENOENT") {
        throw err;
      }
    }
  }

  const result = await run(
    "DELETE FROM comment_attachments WHERE snowflake_id=?",
    [snowflakeId],
  );
  return result?.changes > 0;
}
