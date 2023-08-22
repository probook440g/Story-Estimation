const sendMessageToActiveTab = async (evt) => {
  evt.preventDefault(); // prevents `submit` event from reloading the popup
  const data = evt.target;
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const codingEffortRadioBtns = document.getElementsByName("codingEffort");
  const codingEffort = Array.from(codingEffortRadioBtns).find(
    (radio) => radio.checked
  ).value;
  const codeReviewPerson = document.getElementById("codeReviewerId").value;
  const testinPerson = document.getElementById("testerId").value;

  await chrome.tabs.sendMessage(tab.id, {
    codingEffort,
    codeReviewPerson,
    testinPerson,
  });
};

const onDomContentsLoaded = () => {
  let updateBtn = document.getElementById("updateSubtask");
  updateBtn.addEventListener("click", sendMessageToActiveTab);
};

document.addEventListener("DOMContentLoaded", onDomContentsLoaded, false);
