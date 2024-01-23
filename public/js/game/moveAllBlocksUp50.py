import json

# Open and read the index.json file
with open("public/js/game/index.json", "r") as file:
    index = json.load(file)

blocks = index['blocks']

for block in blocks:
    if block["type"] != "EnemySpawnBlock":
        block["y"] -= 10

# Write the modified data back to index.json
with open("public/js/game/index.json", "w") as file:
    json.dump(index, file)
print("Done")