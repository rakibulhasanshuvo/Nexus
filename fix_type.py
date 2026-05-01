import re

with open('src/components/ResourceFinder.tsx', 'r') as f:
    content = f.read()

# Replace c.code with c.id or just c.name if code doesn't exist
content = content.replace('{c.code} - {c.name}', '{c.name}')

with open('src/components/ResourceFinder.tsx', 'w') as f:
    f.write(content)
