# Pokedex

## New Features and Notes

- Gen 1 seeding endpoint: `POST /pokemon/seed/gen1` loads Pokemon 1-151 from PokeAPI and upserts by Pokemon number.
- PokeAPI integration: pulls name, types, height/weight, and base stats for each Pokemon.
- New repository lookups:
  - `findByNameIgnoreCase(String name)`
  - `findByPokemonNumber(int pokemonNumber)`

## How to Use the Gen 1 Seed

1. Start the app.
2. Call the endpoint:

```bash
curl -X POST http://localhost:8080/pokemon/seed/gen1
```

You should see a response like:

```
Seeded Gen1 Pokemon: 151
```
