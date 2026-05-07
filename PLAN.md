
# Overview

I'm learning react.js. I want to create a react app that is my learning guide and reference library for notes, code challenges and additional learning tools. This app should be deployable but will mostly be run locally.

Most of the pages for each section will be in markdown, so that I can easily update these pages as markdown documents. I need a fast write workflow that doesn't use html for everything.

I need need much complex state or components, this is mostly a react app that has a menu that is populated by the top level directories as listed above like this:

# Structure

Each of the sections will be folder with potential nested sub-folders, each with a numbered markdown files that would read like "1-course-notes.md, 2-course-notes.md". This number pattern would be the same for each section to be consistent.

1. home page
2. a command + k style pop up menu navigation that responses to a search or just shows the top level menu
3. the navigation consists a home page and 4 main sections:
	1. home page
	2. course notes
	3. concepts with code examples and code challenges
	4. react concepts and features and how they map to vanilla js implementations
	5. a guide for writing react from scratch with basic simple features
4. Each section should display a table of contents for the sub-folders and markdown files as links in a left navigation



# Design

Use the dracula color theme for the look and feel. A left navigation should be present to show the table of contents for a specific section. The main content should read like a wiki, most of the content will be used for studying, so pick a good font and size to make it readable and legible.

Make sure to include a syntax highlighter since code blocks will use standard triple backticks for code, mostly react, javascript, html, css and bash cli.


