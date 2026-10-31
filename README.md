# Todo List

A simple browser todo list. Tasks are stored in local storage, so they stay on the device you used to add them.

## Use it

Open `index.html` in a browser, or visit the GitHub Pages site after deploy.

- Add a task with a due date (required)
- Tasks are grouped by month and sorted by date inside each month
- The current month is highlighted
- Overdue and due-today tasks are highlighted
- Mark it done
- Filter by All, Active, or Done
- Delete tasks you no longer need

### Run it locally

This is a static site, so any static file server works. Using Python:

```sh
python -m http.server 8080
```

Then open <http://localhost:8080>. Stop the server with `Ctrl+C`.
