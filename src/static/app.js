document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participantCount = details.participants.length;

        // Build card header
        const header = document.createElement("div");
        header.className = "activity-card__header";
        const headerInfo = document.createElement("div");
        const h4 = document.createElement("h4");
        h4.textContent = name;
        const descP = document.createElement("p");
        descP.className = "activity-card__description";
        descP.textContent = details.description;
        headerInfo.appendChild(h4);
        headerInfo.appendChild(descP);
        const badge = document.createElement("span");
        badge.className = "activity-card__badge";
        badge.textContent = `${spotsLeft} spots left`;
        header.appendChild(headerInfo);
        header.appendChild(badge);

        // Build card meta
        const meta = document.createElement("div");
        meta.className = "activity-card__meta";
        const scheduleP = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleP.appendChild(scheduleStrong);
        scheduleP.appendChild(document.createTextNode(" " + details.schedule));
        const countP = document.createElement("p");
        const countStrong = document.createElement("strong");
        countStrong.textContent = "Participants:";
        countP.appendChild(countStrong);
        countP.appendChild(document.createTextNode(" " + participantCount));
        meta.appendChild(scheduleP);
        meta.appendChild(countP);

        // Build participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "activity-card__participants";
        const h5 = document.createElement("h5");
        h5.textContent = "Signed Up";
        const ul = document.createElement("ul");
        ul.className = "activity-card__participant-list";
        if (details.participants.length > 0) {
          details.participants.forEach((participant) => {
            const li = document.createElement("li");
            li.className = "activity-card__participant";
            const span = document.createElement("span");
            span.className = "activity-card__participant-name";
            span.textContent = participant;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "participant-remove-button";
            btn.setAttribute("data-activity", name);
            btn.setAttribute("data-email", participant);
            btn.setAttribute("aria-label", `Remove ${participant} from ${name}`);
            btn.setAttribute("title", "Remove participant");
            btn.textContent = "×";
            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });
        } else {
          const emptyLi = document.createElement("li");
          emptyLi.className = "activity-card__empty";
          emptyLi.textContent = "No participants yet.";
          ul.appendChild(emptyLi);
        }
        participantsSection.appendChild(h5);
        participantsSection.appendChild(ul);

        activityCard.appendChild(header);
        activityCard.appendChild(meta);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      activitiesList.querySelectorAll(".participant-remove-button").forEach((button) => {
        button.addEventListener("click", async () => {
          const activity = button.dataset.activity;
          const email = button.dataset.email;

          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`,
              {
                method: "DELETE",
              }
            );

            const result = await response.json();

            if (response.ok) {
              messageDiv.textContent = result.message;
              messageDiv.className = "success";
              messageDiv.classList.remove("hidden");
              await fetchActivities();
            } else {
              messageDiv.textContent = result.detail || "An error occurred";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
            }

            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 5000);
          } catch (error) {
            messageDiv.textContent = "Failed to remove participant. Please try again.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
            console.error("Error removing participant:", error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
