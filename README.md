# TodoQ

Inline task queries right inside your Joplin notes.

TodoQ turns a fenced ```` ```todoq ```` block into a live widget: it parses a small DSL, searches your todo-notes in Joplin and renders them as a list in the preview. Right from the widget you can open a task (click on its title) and mark it as done (click on the checkbox).

## Features

- Declarative DSL for querying Joplin tasks
- Filters: status, due date, notebook (including sub-notebooks), tags, full-text search, limit
- Sorting by due / title / created / updated
- Display modes: `list` (all fields) and `custom` (custom set of fields)
- Full notebook path in the task meta
- Open a task by clicking on its title
- Mark as "done" by clicking on the native markdown checkbox
- Automatic preview update on changes
- Configurable date format for literal dates inside queries

## Usage

In any note, insert a fenced block with the language `todoq`:

````markdown
```todoq
status open
due week
sort due asc
view list
```
````

The plugin will execute the query and render the result directly below the code.

---

# Settings

Available under **Settings → TodoQ**:

| Setting                       | Default      | Description                                                                                                       |
|-------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------|
| Date format for `<date-expr>` | `YYYY-MM-DD` | Format used to parse literal dates inside TodoQ queries. Supported tokens: `YYYY`, `YY`, `MM`, `M`, `DD`, `D`.    |

Examples of the date format setting: `YYYY-MM-DD`, `DD.MM.YYYY`, `D/M/YY`.

This setting affects only how you **write** dates in the DSL. Internally dates are normalized and compared in a stable way.

---

# DSL

## General Rules

- Each directive goes on its own line.
- Empty lines are ignored.
- Lines starting with `#` are comments.
- Each directive may appear **at most once**; repeating it overwrites the previous value.
- An unknown directive → `Unknown command "<name>"` error.

## Defaults

| Directive  | Value        |
|------------|--------------|
| `status`   | `open`       |
| `due`      | `any`        |
| `sort`     | `due asc`    |
| `view`     | `list`       |
| `limit`    | —            |
| `notebook` | —            |
| `tag`      | —            |
| `search`   | —            |
| `title`    | `TodoQ`      |

---

## Directives

### `status` — filter by status

```
status <open | done | all>
```

- `open` — only unfinished tasks (default)
- `done` — only completed
- `all` — all of them

### `due` — filter by due date

```
due any                          # any due date or none (default)
due none                         # without a due date
due overdue                      # overdue (open + due < today)
due week                         # next 7 days: range [today, today + 7d]
due <date-expr>                  # exact match
due before <date-expr>           # strictly before
due after  <date-expr>           # strictly after (after the whole day)
due range  <interval>            # arbitrary range with bounds
```

Short aliases (equivalent to a pointwise `due <date-expr>`):

```
due today
due tomorrow
due yesterday
due 2026-05-20            # literal date in the configured format
```

Comparison granularity is **per day** (local time zone). `before`/`after` exclude the whole referenced day; inclusive range bounds include the whole day.

#### `<date-expr>` — date expression

```
<anchor>[<offset>]
```

- **Anchors:** `today`, `tomorrow`, `yesterday`, or a literal date **in the format from settings** (default `YYYY-MM-DD`).
- **Offset (optional):** `<sign><amount><unit>` with arbitrary whitespace between parts.
  - Sign: `+` or `-`
  - Amount: a positive integer
  - Units: `d`/`day`/`days`, `w`/`week`/`weeks`

Examples (assuming the default `YYYY-MM-DD` format):

```
today
today + 3d
today-1d
2026-05-20
2026-05-20 - 1w
2026-05-20-1w
tomorrow + 2 weeks
yesterday-3d
```

If the configured date format is, for example, `DD.MM.YYYY`, you write `01.05.2026` instead of `2026-05-01`.

#### `<interval>` — range for `range`

```
[<date-expr>, <date-expr>]     # both bounds inclusive
(<date-expr>, <date-expr>)     # both exclusive
[<date-expr>, <date-expr>)     # left inclusive, right exclusive
(<date-expr>, <date-expr>]     # left exclusive, right inclusive
```

There must be exactly one comma inside; both parts are required.

Inclusive bound includes the whole day of the bound date; exclusive bound excludes it.

Examples:

```
due range [today, today + 3d]
due range (2026-01-01, 2026-02-01]
due range [today, today + 2w)
```

### `sort` — sorting

```
sort <field> <direction>
```

- `field`: `due`, `title`, `created`, `updated`
- `direction`: `asc`, `desc`

Default: `sort due asc`.

### `view` — display mode

```
view list                       # all fields (default)
view custom <field1>[,<field2>] # custom set of fields
```

Visually both modes look the same: a title plus separate lines for each enabled field. They only differ in which fields are shown.

- `list` — the default mode: title, then due (if any), notebook path, tags (if any). Used when the `view` directive is not specified.
- `custom <fields>` — only the fields listed (comma-separated) are visible. Title and checkbox are always shown.

Supported fields: `due`, `tags`, `path`.

Examples:

```
view list                       # all fields
view custom due                 # only due date
view custom due,tags            # due and tags
view custom path                # only notebook path
```

Restrictions:
- `view list` takes no arguments.
- `view custom` without fields is an error.
- Unknown fields are an error. Duplicates in the list are silently de-duplicated.

### `limit` — limit the count

```
limit <positive integer>
```

Applied **after** sorting.

### `notebook` — filter by notebook

```
notebook <name>                 # exact match by name
notebook "name with spaces"     # name with spaces — in double quotes
notebook under <name>           # the notebook itself and all its children
notebook under "Personal"
```

A name without spaces — without quotes; with spaces — must be in `"..."` (escapes `\"` and `\\` are supported).

### `tag` — filter by tags

```
tag <tag1>[, <tag2>, ...]               # implicit mode: any
tag any <tag1>[, <tag2>, ...]           # at least one of the tags
tag all <tag1>[, <tag2>, ...]           # all tags at once
```

Tags must not contain spaces and are separated by commas.

### `search` — full-text search

```
search "<text>"
```

The text **must** be in double quotes (escapes `\"` and `\\` are supported). Empty text is not allowed.

### `title` — custom block title

```
title "<title>"
```

The text **must** be in double quotes (escapes `\"` and `\\` are supported).

Behavior:
- Directive not specified → default header `TodoQ` is shown.
- `title "Some text"` → that text is shown as the header.
- `title ""` → the header is **hidden** completely.

Examples:

```
title "My tasks for the week"
title "Overdue"
title ""
```

---

## Examples

**Overdue work tasks:**

```todoq
status open
due overdue
tag all work
sort due asc
```

**Top 10 tasks for the next 3 days:**

```todoq
due range [today, today + 3d]
sort due asc
limit 10
```

**Everything open from the "Personal" notebook and its sub-notebooks:**

```todoq
notebook under "Personal"
status open
```

**Tasks without a due date, by tags:**

```todoq
due none
tag any ideas, someday
sort created desc
```

**What I missed yesterday:**

```todoq
due yesterday
status open
```

**Compact output — only due date and tags, no header:**

```todoq
status open
view custom due,tags
title ""
```
