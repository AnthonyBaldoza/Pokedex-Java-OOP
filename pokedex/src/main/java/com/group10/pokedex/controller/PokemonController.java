package com.group10.pokedex.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.group10.pokedex.model.Pokemon;
import com.group10.pokedex.service.PokemonService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/pokemon")
@Validated
public class PokemonController {

    private static final Logger logger = LoggerFactory.getLogger(PokemonController.class);
    private final PokemonService service;

    public PokemonController(PokemonService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Pokemon>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pokemon> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Pokemon>> searchByName(@RequestParam String name) {
        if (name == null || name.trim().isEmpty())
            return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(service.searchByName(name));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Pokemon>> filterByType(@RequestParam String type) {
        if (type == null || type.trim().isEmpty())
            return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(service.filterByType(type));
    }

    @GetMapping("/caught")
    public ResponseEntity<List<Pokemon>> getCaught() {
        return ResponseEntity.ok(service.getCaught());
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<Pokemon>> getFavorites() {
        return ResponseEntity.ok(service.getFavorites());
    }

    @GetMapping("/legendary")
    public ResponseEntity<List<Pokemon>> getLegendary() {
        return ResponseEntity.ok(service.getLegendary());
    }

    @GetMapping("/compare")
    public ResponseEntity<List<Pokemon>> compare(@RequestParam Long id1, @RequestParam Long id2) {
        return service.getById(id1).flatMap(p1 -> service.getById(id2).map(p2 -> List.of(p1, p2)))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<Pokemon> addPokemon(@Valid @RequestBody Pokemon pokemon) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.add(pokemon));
    }

    @PostMapping("/seed/gen1")
    public ResponseEntity<String> seedGen1() {
        int count = service.seedGen1FromApi();
        return ResponseEntity.ok("Seeded Gen1 Pokemon: " + count);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pokemon> updatePokemon(
            @PathVariable Long id,
            @Valid @RequestBody Pokemon updated) {

        Pokemon pokemon = service.update(id, updated);

        return ResponseEntity.ok(pokemon);
    }

    @PatchMapping("/{id}/caught")
    public ResponseEntity<Pokemon> toggleCaught(@PathVariable Long id) {

        Pokemon pokemon = service.toggleCaught(id);

        return ResponseEntity.ok(pokemon);
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<Pokemon> toggleFavorite(@PathVariable Long id) {

        Pokemon pokemon = service.toggleFavorite(id);

        return ResponseEntity.ok(pokemon);
    }

    @PatchMapping("/{id}/legendary")
    public ResponseEntity<Pokemon> toggleLegendary(@PathVariable Long id) {

        Pokemon pokemon = service.toggleLegendary(id);

        return ResponseEntity.ok(pokemon);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePokemon(@PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }
}