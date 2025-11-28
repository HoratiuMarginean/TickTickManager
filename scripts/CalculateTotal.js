import { LOCAL_CURRENCY } from "#constants";
import { GetProjectData, CreateColumn, CreateTask, UpdateTask } from "#ticktickUtility";

const TOTAL_COLUMN_NAME = "Total";

export default async function CalculateTotal()
{
  try
  {
    const ticktickProjectJson = await GetProjectData(process.env.PROJECT_ID_DEBTS);
    const tasks = ticktickProjectJson.tasks;
    const columns = ticktickProjectJson.columns;

    let columnIdTotal = null;
    for (const column of columns)
    {
      if (!columnIdTotal && column.name == TOTAL_COLUMN_NAME)
      {
        columnIdTotal = column.id;
        break;
      }
    }

    if (!columnIdTotal)
    {
      const response = await CreateColumn(process.env.PROJECT_ID_DEBTS, {
        name: TOTAL_COLUMN_NAME
      })
      columnIdTotal = await response.json();
    }

    let totalValue = 0;

    let taskIdTotal = null;
    for (const task of tasks)
    {
      if (task.columnId == columnIdTotal)
      {
        taskIdTotal = task.id;
        continue;
      }

      const trimmedTitle = task.title.trim();
      const splitTitle = trimmedTitle.split(" - ");
      if (splitTitle.length == 1)
      {
        continue;
      }
      
      const value = parseFloat(splitTitle[0].split(LOCAL_CURRENCY)[0].trim());
      if (isNaN(value))
      {
        console.error(`Error: Could not find value in task: ${trimmedTitle}`);
        continue;
      }

      totalValue += value;
    }
    totalValue = totalValue.toFixed(2);

    const newTitle = `${totalValue} RON`;
    if (!taskIdTotal)
    {
      await CreateTask({
        projectId: process.env.PROJECT_ID_DEBTS,
        title: newTitle,
        columnId: columnIdTotal
      });

      console.log(`Debts: Total value added, ${newTitle}`);
    }
    else
    {
      await UpdateTask({
        id: taskIdTotal,
        projectId: process.env.PROJECT_ID_DEBTS,
        title: newTitle,
        columnId: columnIdTotal
      });

      console.log(`Debts: Total value updated, ${newTitle}`);
    }
  }
  catch (err)
  {
    console.error(`Fatal Error: ${err.message}`);
  }
}