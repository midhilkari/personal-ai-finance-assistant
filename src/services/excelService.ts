import xlsx from "xlsx";
import { State } from "../interfaces/State";

export async function parseExcel(filePath: string): Promise<Partial<State>> {
  const workbook = xlsx.readFile(filePath);
  const sheets = workbook.SheetNames;

  const budgetSheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
  const goalsSheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheets[1]]);
  const investmentsSheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheets[2]]);

  return {
    budget: budgetSheet as State["budget"],
    goals: goalsSheet as State["goals"],
    investments: investmentsSheet as State["investments"],
    excelData: {
      content: JSON.stringify({
        budget: budgetSheet,
        goals: goalsSheet,
        investments: investmentsSheet,
      }),
      path: "",
    },
  };
}
