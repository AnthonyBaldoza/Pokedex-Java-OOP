# 🔴 POKÉDEX — Java Spring Boot Web Application (COMP 009)

> A full-stack Pokédex web application for browsing, managing, and tracking Pokémon data through an interactive and responsive web interface.

---

## 👥 Members

| Name | Role |
|------|------|
| Baldoza, Anthony F. | Developer (Solo) |
| Nidea, Aron L. | Member |

**Course:** COMP 009 — Object Oriented Programming
**School:** Polytechnic University of the Philippines — Calauan Campus
**Group:** Group 10

---

## 📌 Project Overview

This project is a **full-stack Pokédex web application** developed as a Final Project for Object-Oriented Programming. It allows users to browse, manage, and track Pokémon data through an interactive and responsive web interface.

The application supports full **CRUD operations** — users can add, view, edit, and delete Pokémon entries. It also features search by name, filter by type, sort options, and the ability to toggle per-Pokémon flags such as **Caught**, **Favorite**, and **Legendary**. Pokémon data can be automatically populated via a **Gen 1 seeder** that fetches live data from the public **PokéAPI**.

---

## ✨ Features

### 🖥️ Frontend
- 📋 Responsive Pokémon card grid showing sprite, number, name, and type badges
- 🔍 Real-time search by Pokémon name
- 🎯 Filter by type and sort options
- ❤️ Toggle **Favorite**, **Caught**, and **Legendary** flags per Pokémon
- 📊 Completion/catch progress bar
- 🌗 Light/Dark mode toggle
- ⚔️ **Compare Mode** — side-by-side Battle Analysis with animated stat bars, winner indicator, and crown icon
- ➕ Add new Pokémon via modal form
- ✏️ Edit existing Pokémon data
- ❌ Delete with explode animation
- 🎮 Switch between All, Caught, Favorites, and Legendary views

### ⚙️ Backend
- Full CRUD REST API
- Gen 1 PokeAPI seeder (auto-populates 151 Pokémon)
- Toggle flags (Caught, Favorite, Legendary)
- Analytics methods (count, stats)
- Global exception handling
- Swagger UI for API documentation
- CORS configuration for frontend-backend communication

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3 |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Frontend | Vanilla HTML, CSS, JavaScript |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Build Tool | Apache Maven |

---

## 📁 Project Structure

```
pokedex/
├── src/
│   ├── main/
│   │   ├── java/com/group10/pokedex/
│   │   │   ├── PokedexApplication.java              # App entry point
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java                  # CORS configuration
│   │   │   │   └── SwaggerConfig.java               # Swagger UI setup
│   │   │   ├── controller/
│   │   │   │   └── PokemonController.java           # REST API endpoints
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java      # JSON error responses
│   │   │   │   └── ResourceNotFoundException.java   # Custom 404 exception
│   │   │   ├── model/
│   │   │   │   └── Pokemon.java                     # JPA Entity class
│   │   │   ├── repository/
│   │   │   │   └── PokemonRepository.java           # Spring Data JPA repository
│   │   │   └── service/
│   │   │       └── PokemonService.java              # Business logic & seeder
│   │   └── resources/
│   │       ├── application.properties               # DB config & JPA settings
│   │       ├── data.sql.backup                      # Sample data backup
│   │       └── static/
│   │           ├── Index.html                       # Frontend SPA
│   │           ├── App.js                           # Frontend logic
│   │           └── Styles.css                       # Frontend styling
│   └── test/
│       └── java/com/group10/pokedex/
│           ├── PokedexApplicationTests.java
│           └── service/
│               └── PokemonServiceTest.java          # Unit tests
├── pom.xml                                          # Maven dependencies
└── README.md
```

---

## 🗄️ Database Structure

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Auto-generated primary key |
| pokemon_number | INTEGER | Official Pokédex number (e.g. 1 = Bulbasaur) |
| name | VARCHAR(100) | Pokémon name |
| type | VARCHAR(50) | Primary type (e.g. Fire, Water) |
| type2 | VARCHAR(50) | Secondary type, nullable |
| height | DOUBLE | Height in meters |
| weight | DOUBLE | Weight in kilograms |
| description | VARCHAR(500) | Short Pokémon description |
| hp | INTEGER | Base HP stat |
| attack | INTEGER | Base Attack stat |
| defense | INTEGER | Base Defense stat |
| special_attack | INTEGER | Base Special Attack stat |
| special_defense | INTEGER | Base Special Defense stat |
| speed | INTEGER | Base Speed stat |
| caught | BOOLEAN | Whether the Pokémon has been caught |
| favorite | BOOLEAN | Whether the Pokémon is marked as favorite |
| legendary | BOOLEAN | Whether the Pokémon is legendary |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pokemon` | Get all Pokémon |
| GET | `/api/pokemon/{id}` | Get Pokémon by ID |
| GET | `/api/pokemon/search?name=` | Search by name |
| GET | `/api/pokemon/filter?type=` | Filter by type |
| POST | `/api/pokemon` | Add new Pokémon |
| PUT | `/api/pokemon/{id}` | Update Pokémon |
| DELETE | `/api/pokemon/{id}` | Delete Pokémon |
| POST | `/api/pokemon/seed/gen1` | Seed Gen 1 Pokémon from PokéAPI |
| PATCH | `/api/pokemon/{id}/caught` | Toggle caught status |
| PATCH | `/api/pokemon/{id}/favorite` | Toggle favorite status |

---

## 🚀 How to Run

### Prerequisites
- Java 21+
- Apache Maven
- PostgreSQL

### Steps

**1. Clone the repository:**
```bash
git clone https://github.com/AnthonyBaldoza/Pokedex-Java-OOP.git
cd Pokedex-Java-OOP/pokedex
```

**2. Configure the database in `application.properties`:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pokedex
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

**3. Run the application:**
```bash
./mvnw spring-boot:run
```

**4. Open the App:**
- Frontend: `http://localhost:8080/Index.html`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

**5. Seed Gen 1 Pokémon (optional):**
```
POST http://localhost:8080/api/pokemon/seed/gen1
```

---

## 🧪 Running Tests

```bash
./mvnw test
```

---

## ⚠️ Challenges & Solutions

**Challenge 1: Sprite URL Mapping Error**
Pokémon sprites were not loading correctly because the app used the database's auto-generated `id` instead of `pokemon_number` to build the PokeAPI sprite URL.
**Solution:** Updated `App.js` to always use `pokemon.pokemonNumber` when building the sprite URL.

**Challenge 2: Duplicate Key Constraint on Re-seed**
Triggering the Gen 1 seed endpoint more than once caused duplicate key constraint violations.
**Solution:** Updated `seedGen1FromApi()` in `PokemonService` to use an upsert pattern — checks if a Pokémon with the same `pokemonNumber` already exists via `findByPokemonNumber()`, and updates it instead of inserting a duplicate.

---

## 📄 License

This project was developed as a Final Project for **COMP 009 — Object Oriented Programming** at **PUP Calauan, Laguna Campus**.
