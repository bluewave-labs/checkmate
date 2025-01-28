---
icon: clock-nine
---

# Maintenance mode

The Maintenance mode allows you to manage and schedule maintenance periods for monitored URLs. During a maintenance window, no pings or HTTP requests are sent to the specified URLs, preventing downtime alerts during scheduled maintenance activities.

### Creating a new maintenance window

When you click the **"Create Maintenance Window"** button, you will see a page similar to this:

<figure><img src="../.gitbook/assets/Screenshot 2024-10-10 at 10.37.36 PM.png" alt=""><figcaption></figcaption></figure>

Here's how to set up a new maintenance window:

**General settings:**

* **Maintenance repeat**: Select how often the maintenance window should repeat (e.g., don't repeat, daily, weekly).
* **Date**: Select the date the maintenance window should start.
* **Start time**: Set the time of day the window begins.&#x20;
* **Duration**: Specify how long the maintenance window should last (in seconds, minutes, or hours).

**Monitor related settings:**

* **Friendly Name**: Provide a descriptive name for the maintenance window (e.g., "Maintenance at 10:37 PM for 30 minutes").
* **Add Monitors**: Select the specific monitors (URLs) for which this maintenance window will apply by typing and selecting from the list.

Once all fields are filled, click **Create maintenance** to save the new window.

### Editing a maintenance window

* To edit an existing window, click the gear icon under **Actions** in the table view.
* Update the required fields and save your changes.

