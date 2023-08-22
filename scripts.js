chrome.runtime.onMessage.addListener((message) => {
  const { codingEffort, codeReviewPerson, testinPerson } = message;

  const loggedInUserElement = document.getElementById(
    "header-details-user-fullname"
  );
  const loggedInUserId = loggedInUserElement.getAttribute("data-username");

  const effortDetails = {
    1: {
      coding: 1,
      codeReview: 0.2,
      contractTesting: 0.4,
      testing: 0.2,
    },
    1.5: {
      coding: 1.6,
      codeReview: 0.2,
      contractTesting: 0.4,
      testing: 0.2,
    },
    2: {
      coding: 2,
      codeReview: 0.2,
      contractTesting: 0.6,
      testing: 0.4,
    },
    2.5: {
      coding: 2.6,
      codeReview: 0.2,
      contractTesting: 0.8,
      testing: 0.4,
    },
    3: {
      coding: 3,
      codeReview: 0.2,
      contractTesting: 0.8,
      testing: 0.6,
    },
    3.5: {
      coding: 3.6,
      codeReview: 0.2,
      contractTesting: 0.8,
      testing: 0.6,
    },
    4: {
      coding: 4,
      codeReview: 0.4,
      contractTesting: 1,
      testing: 0.6,
    },
    4.5: {
      coding: 4.6,
      codeReview: 0.4,
      contractTesting: 1.2,
      testing: 0.8,
    },
    5: {
      coding: 5,
      codeReview: 0.4,
      contractTesting: 1.4,
      testing: 0.8,
    },
  };

  const taskName = {
    0: "coding",
    1: "codeReview",
    2: "contractTesting",
    3: "testing",
  };

  const waitForAriaHiddenToBeFalse = (
    classOrId,
    selectorType,
    indexOfElement = 0
  ) => {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const element =
          selectorType === "class"
            ? document.getElementsByClassName(classOrId)[indexOfElement]
            : document.getElementById(classOrId);

        if (element.getAttribute("aria-hidden") === "false") {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const waitForElementToExist = (
    classOrId,
    selectorType,
    indexOfElement = 0
  ) => {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const element =
          selectorType === "class"
            ? document.getElementsByClassName(classOrId)[indexOfElement]
            : document.getElementById(classOrId);
        if (element) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const waitForElementToDisappear = (
    classOrId,
    selectorType,
    indexOfElement = 0
  ) => {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const element =
          selectorType === "class"
            ? document.getElementsByClassName(classOrId)[indexOfElement]
            : document.getElementById(classOrId);
        if (!element) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const waitForAssigneeToHaveValue = async (expectedValue) => {
    return new Promise(async (resolve) => {
      await waitForElementToExist("assignee", "id");
      const interval = setInterval(async () => {
        const element = document.getElementById("assignee");
        if (element.value === expectedValue) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const closeSuccessMessage = async () => {
    return new Promise(async (resolve) => {
      await waitForElementToExist("aui-icon icon-close", "class");
      const closeMsgBtn = document.getElementsByClassName(
        "aui-icon icon-close"
      )[0];
      closeMsgBtn.click();
      resolve();
    });
  };

  const assignTaskToAnotherPerson = async (taskNo, resolve) => {
    await waitForElementToExist(
      "icon aui-ss-icon drop-menu noloading",
      "class"
    );
    await waitForElementToExist("assignee", "id");
    const assignToField = document.getElementById("assignee");
    const assignToPerson =
      taskNo === 1
        ? codeReviewPerson.toUpperCase()
        : testinPerson.toUpperCase();
    assignToField.value = assignToPerson;
    assignToField.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true })
    );
    await waitForAssigneeToHaveValue(assignToPerson);
    setTimeout(() => resolve(), 800);
  };

  const updateBtnClick = (taskNo) => {
    return new Promise(async (resolve) => {
      await waitForElementToExist("edit-issue-submit", "id");
      const updateBtn = document.getElementById("edit-issue-submit");
      updateBtn.click();
      resolve();
    });
  };

  const enterEstimate = (taskNo) => {
    return new Promise((resolve) => {
      const effortEstimate =
        effortDetails[codingEffort][taskName[taskNo]] + "d";
      const originalEstimateTxtBox = document.getElementById(
        "timetracking_originalestimate"
      );
      originalEstimateTxtBox.value = effortEstimate;

      const remainingEstimateTxtBox = document.getElementById(
        "timetracking_remainingestimate"
      );
      remainingEstimateTxtBox.value = effortEstimate;
      setTimeout(() => resolve(), 300);
    });
  };

  const assignTaskToMyself = async (resolve) => {
    await waitForElementToExist("assignee", "id");
    const assignToField = document.getElementById("assignee");
    if (assignToField.value === loggedInUserId) {
      resolve();
    } else {
      await waitForElementToExist("assign-to-me-trigger", "id");
      const assignToMeBtn = document.getElementById("assign-to-me-trigger");
      assignToMeBtn.click();
      resolve();
    }
  };

  const assignTaskToRespectivePerson = (taskNo) => {
    return new Promise((resolve) => {
      if (taskNo === 0 || taskNo === 2) {
        assignTaskToMyself(resolve);
      } else {
        assignTaskToAnotherPerson(taskNo, resolve);
      }
    });
  };

  const clickEditBtn = () => {
    return new Promise((resolve) => {
      const editBtn = document.getElementsByClassName(
        "aui-list-item-link issueaction-edit-issue"
      )[0];
      editBtn.click();
      resolve();
    });
  };

  const clickKebabMenu = (taskNo) => {
    return new Promise((resolve) => {
      const codingUnitTestingKebabMenu = document.getElementsByClassName(
        "issue-actions-trigger aui-button aui-button-compact aui-button-subtle trigger-happy"
      )[taskNo];
      codingUnitTestingKebabMenu.click();
      resolve();
    });
  };

  async function updateSubTask(taskNo) {
    await clickKebabMenu(taskNo);
    await waitForElementToExist(
      "aui-list-item-link issueaction-edit-issue",
      "class"
    );
    await clickEditBtn();
    await assignTaskToRespectivePerson(taskNo);
    await enterEstimate(taskNo);
    await updateBtnClick(taskNo);
    await waitForElementToDisappear("edit-issue-dialog", "id");
    await waitForElementToExist(
      "aui-message closeable aui-message-success aui-will-close",
      "class"
    );
    await waitForAriaHiddenToBeFalse("aui-flag", "class");
    await closeSuccessMessage();

    console.log(`${taskName[taskNo]} subtask successfully updated`);
  }

  async function assignTasksAndEnterEstimates() {
    await updateSubTask(0); // coding and unit testing
    await updateSubTask(1); // code review
    await updateSubTask(2); // contract testing
    await updateSubTask(3); // testing
  }

  return assignTasksAndEnterEstimates();
});
