const CFG =
{
  LOCAL_CURRENCY: "RON",
  FOREIGN_CURRENCIES: ["EUR", "USD"],
  LOCALE: "ro-RO"
};

async function UpdateExchangeRates()
{
  try
  {
    const ticktickProjectData = await fetch(`https://api.ticktick.com/open/v1/project/${process.env.PROJECT_ID}/data`, {
      headers: { "Authorization": `Bearer ${process.env.TICKTICK_TOKEN}` }
    });
    const ticktickProjectJson = await ticktickProjectData.json();
    const tasks = ticktickProjectJson.tasks;
    const sections = ticktickProjectJson.columns;

    const fxratesData = await fetch(`https://api.fxratesapi.com/latest?base=${CFG.LOCAL_CURRENCY}&currencies=${CFG.FOREIGN_CURRENCIES.join(",")}`);
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
      splitTitle[0] = splitTitle[0].trim().replaceAll(".", "").replaceAll(",", ".");

      let newTitle = null;

      const includesLocalCurrency = splitTitle[0].includes(CFG.LOCAL_CURRENCY);
      
      let foreignCurrency = null;
      for (const currency of CFG.FOREIGN_CURRENCIES)
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
        // 1.424,64 RON (279,99 EUR)
        if (includesLocalCurrency)
        {
          foreignValue = parseFloat(splitTitle[0].split(" (")[1].split(foreignCurrency)[0].trim());
        }
        // 279,99 EUR
        else
        {
          foreignValue = parseFloat(splitTitle[0].split(foreignCurrency)[0].trim());
        }

        localValue = foreignValue * (1.00 / rates[foreignCurrency]);

        localValue = localValue.toLocaleString(CFG.LOCALE, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        foreignValue = foreignValue.toLocaleString(CFG.LOCALE, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        newTitle = `${localValue} ${CFG.LOCAL_CURRENCY} (${foreignValue} ${foreignCurrency}) - ${splitTitle[1]}`;
      }
      else
      {
        // 1.424,64 RON
        if (includesLocalCurrency)
        {
          localValue = parseFloat(splitTitle[0].split(CFG.LOCAL_CURRENCY)[0].trim());
        }
        // ?
        else
        {
          continue;
        }
      }

      const localValueIntegerDigitCount = `${localValue}`.split('.')[0].length;
      const expectedSectionName = `${localValueIntegerDigitCount} Digits`;

      let sectionId = null;
      for (const section of sections)
      {
        if (section.name == expectedSectionName)
        {
          sectionId = section.id;
          break;
        }
      }

      await fetch(`https://api.ticktick.com/open/v1/task/${task.id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.TICKTICK_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: task.id,
          projectId: process.env.PROJECT_ID,
          ...(newTitle && { title: newTitle }),
          ...(sectionId && { columnId: sectionId })
        })
      });

      updatedTasksCount++;
    }
    
    console.log(`Updated ${updatedTasksCount} tasks`);
  }
  catch (error)
  {
    console.error("Error:", error.message);
  }
}

UpdateExchangeRates();