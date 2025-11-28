import { BASE_FXRATES_URL, LOCAL_CURRENCY, FOREIGN_CURRENCIES } from "#constants";
import { GetProjectData, UpdateTask } from "#ticktickUtility";

export default async function UpdateExchangeRates()
{
  try
  {
    const ticktickProjectJson = await GetProjectData(process.env.PROJECT_ID_WISHLIST);
    const tasks = ticktickProjectJson.tasks;
    const columns = ticktickProjectJson.columns;

    const fxratesData = await fetch(`${BASE_FXRATES_URL}/latest?base=${LOCAL_CURRENCY}&currencies=${FOREIGN_CURRENCIES.join(",")}`);
    const fxratesJson = await fxratesData.json();
    const rates = fxratesJson.rates;
    
    let updatedTasksCount = 0;
    for (const task of tasks)
    {
      let splitTitle = task.title.trim().split(" - ");
      if (splitTitle.length == 1)
      {
        continue;
      }

      let newTitle = null;

      const includesLocalCurrency = splitTitle[0].includes(LOCAL_CURRENCY);
      
      let foreignCurrency = null;
      for (const currency of FOREIGN_CURRENCIES)
      {
        if (splitTitle[0].includes(currency))
        {
          foreignCurrency = currency;
          break;
        }
      }

      let localValue = null;
      let foreignValue = null;
      if (foreignCurrency)
      {
        // 1424.64 RON (279.99 EUR)
        if (includesLocalCurrency)
        {
          foreignValue = parseFloat(splitTitle[0].split(" (")[1].split(foreignCurrency)[0].trim());
        }
        // 279.99 EUR
        else
        {
          foreignValue = parseFloat(splitTitle[0].split(foreignCurrency)[0].trim());
        }

        localValue = foreignValue * (1.00 / rates[foreignCurrency]);

        localValue = localValue.toFixed(2);
        foreignValue = foreignValue.toFixed(2);
        newTitle = `${localValue} ${LOCAL_CURRENCY} (${foreignValue} ${foreignCurrency}) - ${splitTitle[1]}`;
      }
      else
      {
        // 1424.64 RON
        if (includesLocalCurrency)
        {
          localValue = parseFloat(splitTitle[0].split(LOCAL_CURRENCY)[0].trim());
        }
        // ?
        else
        {
          continue;
        }
      }

      const localValueIntegerDigitCount = `${localValue}`.split('.')[0].length;
      const expectedcolumnName = `${localValueIntegerDigitCount} Digits`;

      let columnId = null;
      for (const column of columns)
      {
        if (column.name == expectedcolumnName)
        {
          columnId = column.id;
          break;
        }
      }

      await UpdateTask({
        id: task.id,
        projectId: process.env.PROJECT_ID_WISHLIST,
        ...(newTitle && { title: newTitle }),
        ...(columnId && { columnId: columnId })
      })

      updatedTasksCount++;
    }
    
    console.log(`Wishlist: Updated ${updatedTasksCount} tasks`);
  }
  catch (err)
  {
    console.error(`Fatal Error: ${err.message}`);
  }
}