
## My notes about technical tasks

### Task 1 — Fixing the broken import

When I ran the import with the sample CSV I got a database error about a duplicate `hr_id`. The CSV data itself looked perfectly fine, so I knew the problem was coming from somewhere inside the code rather than the file.

I've actually run into this one before :) In PHP, when you loop over an array using a reference (`foreach ($rows as &$row)`), the loop variable stays pointing at the last element even after the loop ends. So when the second loop kicks in and starts assigning values to $row, it's quietly overwriting that last element on every iteration. By the time the loop gets to the actual last row, it has already been replaced with a copy of the row before it, which means the same `hr_id` ends up being inserted twice and SQLite throws a constraint error.

The fix was a single line: `unset($row)` right after the first loop, which breaks that reference before the second foreach loop runs.

### Task 2 — Supporting updates

**Upsert on import**

Before inserting a row, the import pipeline now checks whether that `hr_id` is already in the store. If it is, it updates the existing record instead of trying to create a new one. If it is not, it inserts as normal. The summary returned by the API now reports created and updated as separate numbers so you can see at a glance what actually changed.

**Edit user flow**

I kept the edit UI inside the existing Users page rather than adding a separate page. Each row has an Edit button that opens a modal with the user's current data pre-filled. I went with a modal rather than an inline row editor because I find it cleaner to work with and it gives the form more breathing room, which makes it nicer to use especially if more fields get added later. Clicking outside the modal or pressing Cancel closes it without saving. On save, the app calls the `updateUser` mutation and refreshes the list so the change shows up straight away.

The `updateUser` resolver was already stubbed out in the codebase, I just wired it up to the repository and mapped the input fields to the right database columns.

**Trade-offs**

The current upsert does a separate `SELECT` for every row to check if that `hr_id` already exists before deciding to insert or update. For a small CSV this is fine, but if the store ever grew to a million users and the nightly export had hundreds of thousands of rows, that would be a lot of individual database lookups per import run. A better approach at that scale would be to load all existing `hr_id` values into memory once before the loop starts, or use a database-level upsert so the check and write happen in a single operation rather than two.

The modal adds a small extra component but keeps `UserTable` completely stateless, which makes it easier to test and reason about. The list refresh after saving does a full refetch rather than updating just the one row locally, which is a small extra round trip but keeps the code simple and avoids the list ever being out of sync.

### Task 3 — Handling very large files

For very long running imports you would also want to push the work into a background job, return a job ID to the client immediately, and let the UI poll for progress. That way the HTTP request does not time out and the user gets feedback as the import works through the file. I think this will be the biggest lifesaver (processing it in batches of like 50k or something)

On he transport side, the app currently reads the whole CSV into the browser, base64-encodes it, and sends it as a single GraphQL string. For a file with hundreds of thousands of rows that string could easily be 50 to 100 MB. A better approach would be to send the file as a standard multipart HTTP upload instead, which avoids the base64 overhead and lets the browser stream the bytes without holding the whole thing in memoryt.

On the server side, `CsvReader` loads every row into a PHP array before any processing happens. If you instead read and process one row at a time using a generator (returning each row from `fgetcsv` as you go), the memory usage stays constant no matter how big the file is. The import pipeline would need to accept an iterable rather than a full array, but the rest of the logic stays the same.

