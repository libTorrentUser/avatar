#!/bin/sh

# curl -i -X GET http://rest-api.io/items
# curl -i -X GET http://rest-api.io/items/5069b47aa892630aae059584
# curl -i -X DELETE http://rest-api.io/items/5069b47aa892630aae059584
# curl -i -X POST -H 'Content-Type: application/json' -d '{"name": "New item", "year": "2009"}' http://rest-api.io/items
# curl -i -X PUT -H 'Content-Type: application/json' -d '{"name": "Updated item", "year": "2010"}' http://rest-api.io/items/5069b47aa892630aae059584

_password="$1"

_host='http://localhost:8000'

curl -i -X POST -H 'Content-Type: 'text/plain'' -d "$_password" "${_host}/decrypt"
