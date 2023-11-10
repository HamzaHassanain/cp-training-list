import { get_cf_problem } from "./api.js";
import ls from "./LS.js";

const cfHandleForm = document.querySelector("#cf-login");
const removeHandleBtn = document.querySelector("#remove-handle");
const addProblemForm = document.querySelector("#add-problem-form");
const problemList = document.querySelector(".problem-list");
const welcome = document.querySelector("#welcome-name");

init();

function init() {
  const handle = ls.get("cf-handle");
  const problem_list = ls.get("problem-list");

  if (handle) {
    cfHandleForm["cf-handle"].value = handle;
    welcome.innerHTML = `${handle}`;
  }
  if (problem_list)
    problemList.innerHTML = generate_problem_list_html(problem_list);

  addProblemForm.addEventListener("submit", handleAddProblemFormSubmit);
  cfHandleForm.addEventListener("submit", handleCfHandleFormSubmit);
  removeHandleBtn.addEventListener("click", handleRemoveHandle);

  set_problem_event_listeners();
}

async function handleAddProblemFormSubmit(e) {
  e.preventDefault();

  const url = addProblemForm["problem-url"].value;

  if (problem_exists(url)) {
    alert("Problem already exits");
    return;
  }

  const [err, problem] = await get_cf_problem(url);

  if (err) {
    alert(err?.message);
    return;
  }

  const problem_list = ls.get("problem-list") || [];
  problem_list.push(problem);
  ls.set("problem-list", problem_list);

  const problem_html = create_problem_html(
    problem.name,
    problem.url,
    problem.status
  );
  problemList.innerHTML += problem_html;

  addProblemForm["problem-url"].value = "";
  set_problem_event_listeners();
}

function handleCfHandleFormSubmit(e) {
  e.preventDefault();
  const handle = cfHandleForm["cf-handle"].value;
  welcome.innerHTML = `${handle}`;
  ls.set("cf-handle", handle);

  //   update_problem_list();
}
function handleRemoveHandle() {
  ls.set("cf-handle", null);
  cfHandleForm["cf-handle"].value = "";
  welcome.innerHTML = "";
}

function create_problem_html(name, url, status) {
  const html = `
    <li class="problem-list-item ${status}">
    <button class="delete-problem">&#10006;</button>
    <div class="problem">
      <a href="${url}" target="_balnk">${name}</a>
      <div class="btns">
        <button class="none">NONE</button>
        <button class="acc">ACC</button>
        <button class="wa">WA</button>
      </div>
    </div>
  </li>
    `;
  return html;
}
function set_problem_event_listeners() {
  const problem_list_items = document.querySelectorAll(".problem-list-item");

  problem_list_items.forEach((item) => {
    const acc_btn = item.querySelector(".acc");
    const wa_btn = item.querySelector(".wa");
    const none_btn = item.querySelector(".none");
    const delete_btn = item.querySelector(".delete-problem");

    acc_btn.addEventListener("click", () => {
      handle_acc(item);
    });
    wa_btn.addEventListener("click", () => {
      handle_wa(item);
    });
    none_btn.addEventListener("click", () => {
      handle_none(item);
    });
    delete_btn.addEventListener("click", () => {
      handle_delete(item);
    });
  });
}
function handle_acc(item) {
  const url = item.querySelector("a").href;

  update_problem_status(url, "acc");

  item.classList.remove("none");
  item.classList.remove("wa");
  item.classList.add("acc");
}
function handle_wa(item) {
  const url = item.querySelector("a").href;

  update_problem_status(url, "wa");

  item.classList.remove("none");
  item.classList.remove("acc");
  item.classList.add("wa");
}
function handle_none(item) {
  const url = item.querySelector("a").href;

  update_problem_status(url, "none");

  item.classList.remove("wa");
  item.classList.remove("acc");
  item.classList.add("none");
}
function handle_delete(item) {
  if (!confirm("Are you sure you want to delete this problem?")) return;
  const url = item.querySelector("a").href;

  const problem_list = ls.get("problem-list") || [];
  const new_problem_list = problem_list.filter(
    (problem) => problem.url !== url
  );
  ls.set("problem-list", new_problem_list);
  item.remove();
}

function generate_problem_list_html(problem_list) {
  return problem_list
    .map((problem) =>
      create_problem_html(problem.name, problem.url, problem.status)
    )
    .join("");
}

function update_problem_status(url, status) {
  const problem_list = ls.get("problem-list") || [];
  const problem = problem_list.find((problem) => problem.url === url);
  if (!problem) return;

  problem.status = status;
  ls.set("problem-list", problem_list);
}
function problem_exists(url) {
  const problem_list = ls.get("problem-list") || [];
  const problem = problem_list.find((problem) => problem.url === url);
  if (!problem) return false;
  return true;
}
