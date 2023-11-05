import ls from "./LS.js";

function parse_cf_problem(url) {
  const list = url.split("/");
  if (url.includes("problemset")) {
    const problemIndex = list.at(-1);
    const contestId = list.at(-2);
    return [contestId, problemIndex];
  } else {
    throw new Error("Invalid url");
  }
}

async function get_cf_problemset() {
  const response = await fetch(
    "https://codeforces.com/api/problemset.problems"
  );
  const data = await response.json();
  if (data.status !== "OK") throw new Error("Error fetching data");
  return data;
}

export async function get_cf_problem(url) {
  if (!valid_cf(url)) return [new Error("Invalid url"), null];

  try {
    const problemset = await get_cf_problemset();
    const handle = ls.get("cf-handle");
    const [contestId, problemIndex] = parse_cf_problem(url);

    console.log(contestId, problemIndex);

    const problem_name = problemset.result.problems.find(
      (problem) =>
        problem.contestId == contestId && problem.index == problemIndex
    )?.name;

    if (!problem_name) throw new Error("Problem not found");

    const problem = {
      name: problem_name,
      status: "none",
      url,
    };

    if (handle) {
      problem.status = await get_problem_status(
        handle,
        contestId,
        problemIndex
      );
    }
    return [null, problem];
  } catch (err) {
    console.log(err);

    return [err, null];
  }
}

function valid_cf(url) {
  const list = url.split("/");
  if (!url.includes("problemset")) return false;
  const problemIndex = list.at(-1);
  const contestId = list.at(-2);
  if (!problemIndex || !contestId) return false;

  const id = parseInt(contestId);
  if (isNaN(id)) return false;
  if (problemIndex.length > 1) return false;

  return true;
}

async function get_problem_status(handle, contestId, problemIndex) {
  const response = await fetch(
    `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`
  );
  const data = await response.json();
  if (data.status !== "OK") throw new Error("Error fetching data");
  const problem = data.result.find(
    (problem) =>
      problem.problem.contestId == contestId &&
      problem.problem.index == problemIndex
  );

  if (!problem) return "none";
  let verdict = problem.verdict.toLowerCase();

  if (verdict == "ok") verdict = "acc";
  else verdict = "wa";

  return verdict;
}
