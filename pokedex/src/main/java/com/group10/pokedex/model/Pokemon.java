package com.group10.pokedex.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "pokemon")
public class Pokemon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pokemon_number", columnDefinition = "integer default 0")
    @Min(value = 1, message = "Pokédex number must be at least 1")
    private int pokemonNumber;

    @NotBlank(message = "Name is required")
    @Column(length = 100, nullable = false)
    private String name;

    @NotBlank(message = "Type is required")
    @Column(length = 50, nullable = false)
    private String type;

    @Column(name = "type2", length = 50)
    private String type2;

    @Positive(message = "Height must be positive")
    @Column(nullable = false)
    private double height;

    @Positive(message = "Weight must be positive")
    @Column(nullable = false)
    private double weight;

    @Column(length = 500)
    private String description;

    // ── Base Stats ──
    @Column(columnDefinition = "integer default 0")
    private int hp;

    @Column(columnDefinition = "integer default 0")
    private int attack;

    @Column(columnDefinition = "integer default 0")
    private int defense;

    @Column(name = "special_attack", columnDefinition = "integer default 0")
    private int specialAttack;

    @Column(name = "special_defense", columnDefinition = "integer default 0")
    private int specialDefense;

    @Column(columnDefinition = "integer default 0")
    private int speed;

    // ── Trainer Flags ──
    @Column(columnDefinition = "boolean default false")
    private boolean caught = false;

    @Column(columnDefinition = "boolean default false")
    private boolean favorite = false;

    // ✅ NEW: Legendary flag
    @Column(name = "legendary", columnDefinition = "boolean default false")
    private boolean legendary = false;

    public Pokemon() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getPokemonNumber() {
        return pokemonNumber;
    }

    public void setPokemonNumber(int pokemonNumber) {
        this.pokemonNumber = pokemonNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getType2() {
        return type2;
    }

    public void setType2(String type2) {
        this.type2 = type2;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getHp() {
        return hp;
    }

    public void setHp(int hp) {
        this.hp = hp;
    }

    public int getAttack() {
        return attack;
    }

    public void setAttack(int attack) {
        this.attack = attack;
    }

    public int getDefense() {
        return defense;
    }

    public void setDefense(int defense) {
        this.defense = defense;
    }

    public int getSpecialAttack() {
        return specialAttack;
    }

    public void setSpecialAttack(int specialAttack) {
        this.specialAttack = specialAttack;
    }

    public int getSpecialDefense() {
        return specialDefense;
    }

    public void setSpecialDefense(int specialDefense) {
        this.specialDefense = specialDefense;
    }

    public int getSpeed() {
        return speed;
    }

    public void setSpeed(int speed) {
        this.speed = speed;
    }

    public boolean isCaught() {
        return caught;
    }

    public void setCaught(boolean caught) {
        this.caught = caught;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }

    public boolean isLegendary() {
        return legendary;
    }

    public void setLegendary(boolean legendary) {
        this.legendary = legendary;
    }
}