---------------
TYPOLOGY
---------------
## Types of PathSets [pathset typologies]
Nodes:
* node:      a resource that can have 1+ properties
* nodeSet:   a collection of 0+ nodes, and 0+ properties
* value:     a node with a single value and an optional $type
* property:  the superset of nodes and value literals

Links:
* key:       a node link to a property
* range:     a node link to multiple properties
* keySet:    a 1+ keys

Actions:
* invalidate: either update, or invalidate and let falcor update
* update: explicitly update

Cells:
* nodeSet
* node
* value:           terminal node
* property:        link on node
* rangeProperty:   link on nodeSet

Cells 2.0:
* nodeSubset:      a node on a nodeSet - points to a filtered/ordered nodeSet
* aggregateNode:   a node on a nodeSet (or maybe a rangeProperty) - points to a value (e.g. length, min/max, avg)
* facetNode:       a node on a rangeProperty - points to a nodeSet of facets (a predicate facet)
* computedNode:    a node whose value is the result of a function of 2+ nodes,
* ellipsis:        a cell representing the remainder of an unloaded nodeSet or rangeProperty (could be used to spawn aggregateNodes)


## Data Structure
* jsonGraph: db state
* queryTree: UI state
  * converts matrix into path queries
  * converts jsonGraph into a matrix of cells
* tableMatrix: the UI layout


---------------
ROUTER
---------------
## Node responses
* node exists
* node is blank (doesn't exist)
* node is error (may or may not exist)
  * error should be retried
  * error should not be retried



## Minimum routes
* get tableById[{keys:idx}][{keys:fields}]
* set tableById[{keys:idx}][{keys:fields}]
* get tableById[{keys:idx}].contains[{integers:indices}]
  * redirect to tableById
* get tableById[{keys:idx}].contains.length
* get tableList[{integers:indices}]
  * redirect to tableById
* get tableList.length



## Optimized routes
* tableList[{integers:indices}][{keys:fields}]
  * 2 queries -> 1
* tableById[keys:idx].contains[{integers:indices}][{keys:fields}]
  * 2 queries -> 1
* tableList[{integers:indices}].contains[{integers:indices}]
  * 2 queries -> 1
* tableList[{integers:indices}].contains[{integers:indices}][{keys:fields}]
  * 3 queries -> 1 [get ids of parent folders, get ids of child folders, get fields of child folders]



## Dependency Mutation: nodes that must update when another node/nodeCollection updates
* atomic updates to nodes should not force mutations elsewhere in the graph b/c of refs
* adding/deleting nodes requries that:
  * dependent nodeSet that contains/contained the changed node recalculates its refs
    invalidate nodeSet[changedNodeIdx..-1]
  * dependent keys on a nodeSet that contains/contained the changed node recalculate their property
    invalidate nodeSet.length, nodeSet.avg

### Explicit nodeSet dependencies (dependency is known by mutating node, so handled on server)
  * invalidate dependent nodeSets:
    tableList[insertedNodeIdx..-1], tableSubList[insertedNodeIdx..-1]
  * invalidate dependent keys:
    tableList.length
### Implicit dependencies (dependency is unknown by mutating node, so handled on the client)
  * client invalidates dependent nodeSet on error
    invalidate nodeSet[errorNodeIdx..-1]
  * client can't invalidate dependent keys?


## Falcor Schema
* the router can be schemaless (unlike GraphQL)
* however, exposing a node.schema or node.? path syntax would introduce introspection into queries, and allow for interactive querying
  * see graphQL swapi: http://graphql-swapi.parseapp.com/
  * node gets description, fieldList
  * field gets description, type/typeList



## Relational Spreadsheets
* names
  * Table
  * Orpheus
  * VisiCalc



## Falcor Architecture
Model (this is where the meat is... cache)
DataProvider
Server Middleware (falcor-express)
Falcor-Router





## SQL Router
Modeling your data as a single graph has two benefits
* models API requests that are more flexible than relational/RESTful requests:
  * rather than requesting a single resource, or optionally a partial resource, optionally overloaded with related resources, allows requests that walk through the graph, making requests at the value level rather than the resource level
* can abstract that graph across many different backend services

The Falcor-Router accomplishes both.  However, in cases where the backend is simple enough that it doesn't need to be stored across multiple services, but where the flexibility of a graph data structure is still useful, the Falcor-Router can be overkill.

However
* some of the routes will necessarily be expensive.
  * E.g. how do you efficiently query "for folders x and y, get the name and id of the 5 - 10 subfolders of each", or as a path ['folder', ['x', 'y'], 'folders', {from:5, to:10}, ['id', 'name']]

### Needs
* sanitize input
* route should dynamically match table schema?
  * folder -> GET folder[field1, field2, field3]
* should export documentation
  * your jsonGraph looks like:
* optimize between LIMIT/OFFSET and WHERE rowId IN (...)
* wrap node-sqlite in an observable
* core vs optimization routes: figure out what core routes cover all usecases minimally (with potentially multiple db request), then define optimization routes to lessen db requests.
  * an optional metadata tag, or a server log, could track the number of db requests and the time it took to respond, suggesting new optimization routes




## Falcor questions
* server doesn't have a cache -- how do optimizations work when node A and C are known, client issues request A.B.C, server returns B.C, even though it really only needed to return B w/ a ref to C
  * it could either return all refs and full nodes (overfetch)
  * it could return only refs, and let client issue another request for whatever full nodes are missing (underfetch)


## RivREST
* falcor queryParmas/request body is not getting properly URLEncoded
