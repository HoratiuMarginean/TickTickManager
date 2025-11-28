import { BASE_TICKTICK_URL } from "#constants";

export async function GetProjects()
{
  const response = await fetch(`${BASE_TICKTICK_URL}/open/v1/project`, {
    headers: { "Authorization": `Bearer ${process.env.TICKTICK_TOKEN}` }
  });
  return response.json();
}

export async function GetProjectData(projectId)
{
  const response = await fetch(`${BASE_TICKTICK_URL}/open/v1/project/${projectId}/data`, {
    headers: { "Authorization": `Bearer ${process.env.TICKTICK_TOKEN}` }
  });
  return await response.json();
}

export async function CreateColumn(projectId, requestBody)
{
  const response = await fetch(`${BASE_TICKTICK_URL}/open/v1/project/${projectId}/column`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.TICKTICK_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  return await response.json();
}

export async function CreateTask(requestBody)
{
  const response = await fetch(`${BASE_TICKTICK_URL}/open/v1/task`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.TICKTICK_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  return await response.json();
}

export async function UpdateTask(requestBody)
{
  const response = await fetch(`${BASE_TICKTICK_URL}/open/v1/task/${requestBody.id}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.TICKTICK_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  return response.json();
}