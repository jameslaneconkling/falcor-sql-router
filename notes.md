If falcor can model RDF, then it can abstract over a number of RDF datasources, allowing a client to transparently query across multiple, potentially interlinked, dataset without having to handle the complex logic of munging data between different domains

---------------
TYPOLOGY
---------------
# Graph Entities
Nodes:
* resource:            a node that can have 1+ properties
* literalValue:        a node with a single value and an optional $type
* virtualValue:        a node with a single value that is calculated on the fly

Collection:
* collection:        a collection of 0+ nodes, and 0+ properties
  * collection range types:
    * map collection   a collection of ids
    * list collection  a collection of indices
  * collection positions:
    * top-level        link to all data across entire dataset (e.g. personList or persons)
    * relative         link to data relative to a specific domain (e.g. persons.id.brothers)
* collectionQuery    a filter and/or sort operation on collection

Links:
* predicate:           1 link from a node or collection to 1+ properties (nodes)
* virtualPredicate:    1 link from a collection to 1+ properties that change whenever anything in the collections changes
* range:               1+ links from a list collection to 1 property (node)
* ids:                 1+ links from a map collection to 1 property (node)


### Pathset Typology
* PathSets are queries that walk a graph in order to return a value (resource, literalValue, virtualValue)
* queries must start w/ a collection, and end with a predicate:  Person[id].name or People[range].name
  * you can ask "what is the average age of Group", or "what is PersonX's age"
  * you can't ask "what is Group", or "what is PersonX"
    * but you could potentially ask the more precise questions "give me a summar of PersonX" or "give me schema metadata on PersonX"
* queries resolve to 1+ nodes
* fragments of queries can resolve to 1+ nodes
* nodes don't actually appear in queries, but are represented by queries/query fragments
* virtual values must get invalidated whenever their dependencies change
collection -> predicate | virtualPredicate | range | ids | collectionQuery
collectionQuery -> predicate | range | ids | collectionQuery
predicate -> terminate | range
range -> predicate
ids -> predicate



Actions:
* invalidate: either update, or invalidate and let falcor update
* update: explicitly update

Cells:
* collection
* node
* value:           terminal node
* property:        link on node
* rangeProperty:   link on collection

Cells 2.0:
* nodeSubset:      a node on a collection - points to a filtered/ordered collection
* aggregateNode:   a node on a collection (or maybe a rangeProperty) - points to a value (e.g. length, min/max, avg)
* facetNode:       a node on a rangeProperty - points to a collection of facets (a predicate facet)
* computedNode:    a node whose value is the result of a function of 2+ nodes,
* ellipsis:        a cell representing the remainder of an unloaded collection or rangeProperty (could be used to spawn aggregateNodes)


# Data Structure
* jsonGraph: db state
* queryTree: UI state
  * converts matrix into path queries
  * converts jsonGraph into a matrix of cells
* tableMatrix: the UI layout


---------------
ROUTER
---------------
# Node responses
* node exists
* node is blank (doesn't exist)
* node is error (may or may not exist)
  * error should be retried
  * error should not be retried



# Minimum routes
* get/set mapCollection[{keys:idx}][{keys:valueFields}]
* get mapCollection[{keys:idx}][{keys:fields}]
* get/set mapCollection[{keys:idx}][{keys:refFields}][{range:indices}][{keys:fields}]
  * either a virtualField (e.g. length) or refField (e.g. Person.brothers.0.homeTown.name) or a literalField (Person.brothers.favoriteMusic, but maybe a literalValue on a list is a bad idea)
  * how to differentiate between a valueField and a listField?
    * either create a convention, e.g. prepend 'contains': Person.contains.brothers.0.contains.homeTown
    * or allow nodes to resolve to their label: Person.brothers.0 === Person.brothers.0.label
    * or allow introspection along the way: Person.brothers.schema -> {$type: 'atom', fieldType: 'refField', label: 'brother', comment: 'someone\'s brother', type: 'predicate'}
* get listCollection[{range:indices}][{keys:fields}]
  * how to differentiate b/t listCollection and mapCollection?  introspection?



# Optimized routes
* tableList[{integers:indices}][{keys:fields}]
  * 2 queries -> 1
* tableById[keys:idx].contains[{integers:indices}][{keys:fields}]
  * 2 queries -> 1
* tableList[{integers:indices}].contains[{integers:indices}]
  * 2 queries -> 1
* tableList[{integers:indices}].contains[{integers:indices}][{keys:fields}]
  * 3 queries -> 1 [get ids of parent folders, get ids of child folders, get fields of child folders]



# Dependency Mutation: nodes that must update when another node/nodeCollection updates
* atomic updates to nodes should not force mutations elsewhere in the graph b/c of refs
* adding/deleting nodes requries that:
  * dependent collection that contains/contained the changed node recalculates its refs
    invalidate collection[changedNodeIdx..-1]
  * dependent keys on a collection that contains/contained the changed node recalculate their property
    invalidate collection.length, collection.avg

### Explicit collection dependencies (dependency is known by mutating node, so handled on server)
  * invalidate dependent collections:
    tableList[insertedNodeIdx..-1], tableSubList[insertedNodeIdx..-1]
  * invalidate dependent keys:
    tableList.length
### Implicit dependencies (dependency is unknown by mutating node, so handled on the client)
  * client invalidates dependent collection on error
    invalidate collection[errorNodeIdx..-1]
  * client can't invalidate dependent keys?



# Converting JSONGraph to DB queries
node queries need to handle
* get literal predicate value: Person.age
* get relationship predicate: Person.brothers[range]
* get relationship predicate count: Person.brothers.length

node map collection queries need to hangle
* get node by id: SocialSecurityNumber[ssn]

node list collection queries need to handle
* get collection nodes: People[range]
* get collection count: People.length

node list collection queries _could_ handle
* get collection metadata: People.label, People.comment
* get collection aggregate stats: People.age.avg, People.hometown.facet[range]
* get filtered collection: People[age > 20][range]
* get sorted collection: People[age:desc][range]

### So, in order to cover MVP above, I need
* a way to differentiate bt/ a literal predicate and a relationship predicate
* a way to differentiate bt/ map and list collections



# Falcor Schema
* the router can be schemaless (unlike GraphQL)
* however, exposing a node.schema or node.? path syntax would introduce introspection into queries, and allow for interactive querying
  * see graphQL swapi: http://graphql-swapi.parseapp.com/
  * node gets description, fieldList
  * field gets description, type/typeList
* isn't there a REST equivalent for defining meta endpoints that describe what other endpoints are available



# Relational Spreadsheets
* names
  * Table
  * Orpheus
  * VisiCalc



# Falcor Architecture
Model (this is where the meat is... cache)
DataProvider
Server Middleware (falcor-express)
Falcor-Router





# SQL Router
Modeling your data as a single graph has two benefits
* models API requests that are more flexible than relational/RESTful requests:
  * rather than requesting a single resource, or optionally a partial resource, optionally overloaded with related resources, allows requests that walk through the graph, making requests at the value level rather than the resource level
* can abstract that graph across many different backend services

The Falcor-Router accomplishes both.  However, in cases where the backend is simple enough that it doesn't need to be stored across multiple services, but where the flexibility of a graph data structure is still useful, the Falcor-Router can be overkill.

However
* some of the routes will necessarily be expensive.
  * E.g. how do you efficiently query "for folders x and y, get the name and id of the 5 - 10 subfolders of each", or as a path ['folder', ['x', 'y'], 'folders', {from:5, to:10}, ['id', 'name']]
* this would act like an ORM, mapping jsonGraph to SQL statements, but likely suffering from the inflexibility that all ORMs suffer from
  * routes could guarantee that properly-formed jsonGraph queries would be translated into equivalent SQL queries, but not that they would translate to the most efficient queries

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




# Falcor questions
* server doesn't have a cache -- how do optimizations work when node A and C are known, client issues request A.B.C, server returns B.C, even though it really only needed to return B w/ a ref to C
  * it could either return all refs and full nodes (overfetch)
  * it could return only refs, and let client issue another request for whatever full nodes are missing (underfetch)


# RivREST
* falcor queryParmas/request body is not getting properly URLEncoded





# IMPLICIT INVALIDATION
{
  id: {
    A: $atom
    B: $atom
  },
  list: {
    0: $ref([id, A]),
    1: $ref([id, B])
  }
}

// DELETE A

{
  id: {
    // invalidated
    B: $atom
  },
  list: {
    0: $ref([id, A]),
    1: $ref([id, B])
  }
}

// GET LIST
  // triggers GET id.A, even though we know it doesn't exist (req #2)

list {
  0: $error
  1: B
}

  // Rx stream's catch handler invalidates [0..length] and all virtual fields ['length']
  // which prompts request for GET list[0..1] (req #3)
{
  id: {
    B: $atom
    C: $atom
  },
  list: {
    0: $ref([id, B]),
    1: $ref([id, C])
  }
}


