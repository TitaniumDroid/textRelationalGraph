# Text-Based Relational Graphs

This project turns text into a graph based on the information extracted from the text by use of a LLM.

In the case of taxonomic graphs, the result should be a tree for which the root captures the main idea of the text, its children are the next most important derivative ideas (like subheadings in an article, or chapters in a book), and so on until the leafs which store the fine grained detail of the text.

There are many possible ways of building a relational graph, we are interested in two types of information, the hierarchy of ideas (a tree structure which we also refer to as a taxonomy) and a graph of objects in the text (events, people, etc..) linked by the details that relate them.

As of right now, the graph structure is not defined well enough to prompt and visualize.

## How to use

This repository is a website, if you run it locally on your browser you should experience a simple interactive and minimalist demo.

As of the time I am writing this, the demo requires you to upload a json file. Try uploading one of the example JSON files to see it in action.

## Prompts

There are prepared prompts for each of the distinct tasks.

Unconditional : text -> graph

Conditional: graph, text -> updated graph

Single: The full graph is rendered from one prompt.

Iter: The prompt is meant to be used iteratively to populate the graph.

Taxonomy: tree structure based off the levels of abstraction from the information present in the text.

Graph: Possibly-cyclic graph which has yet to be properly defined.
