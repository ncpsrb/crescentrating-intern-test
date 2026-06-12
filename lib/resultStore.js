import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const RESULT_FILE_PATH = path.join(process.cwd(), "result");

// Optional debug writer. UI does not depend on this file.
export async function writeResultFileIfChanged(result) {
  const nextText = `${JSON.stringify(result, null, 2)}\n`;
  const currentText = await readExistingResultText();

  if (isSameResultData(currentText, result)) {
    return {
      path: RESULT_FILE_PATH,
      changed: false,
    };
  }

  await writeFile(RESULT_FILE_PATH, nextText, "utf8");

  return {
    path: RESULT_FILE_PATH,
    changed: true,
  };
}

async function readExistingResultText() {
  try {
    return await readFile(RESULT_FILE_PATH, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

function isSameResultData(currentText, nextResult) {
  if (!currentText) {
    return false;
  }

  try {
    const currentResult = JSON.parse(currentText);

    return JSON.stringify(stripRunFields(currentResult)) === JSON.stringify(stripRunFields(nextResult));
  } catch {
    return false;
  }
}

function stripRunFields(result) {
  const { retrievalDate, ...stableResult } = result;

  return stableResult;
}
