# Spring Boot project conventions learned from LibraryManagementSystem

## 1. Package and folder structure
- controller/: REST controllers
- service/: interfaces for business logic
- service/impl/: implementation classes
- repository/: Spring Data JPA repositories
- model/ or domain/: JPA entities
- payload/dto/: DTO classes
- payload/request/: request payload classes
- payload/response/: response payload classes
- mapper/: mapping between entities and DTOs
- exception/: custom exceptions
- config/ or Configrations/: configuration classes

## 2. Naming conventions
- Controllers: NameController
- Services: NameService
- Service implementations: NameServiceImpl
- Repositories: NameRepository
- Entities: Name (e.g. Book, Author)
- DTOs: NameDTO
- Requests: NameRequest
- Responses: NameResponse
- Mappers: NameMapper
- Exceptions: NameException

## 3. JPA coding conventions
- Use @Entity on domain/model classes
- Use @Table(name = "...") when table name needs explicit mapping
- Use @Id and @GeneratedValue(strategy = GenerationType.IDENTITY)
- Use @ManyToOne, @OneToMany, @ManyToMany as needed
- Keep entity fields simple and mapped clearly
- Use Lombok annotations: @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor, @Builder

## 4. DTO conventions
- DTOs are used to expose data to clients
- Keep DTOs separate from entities
- Use fields that are relevant for API contract
- Example: AuthorDTO with id, authorName, nationality, biography, createdAt, updatedAt

## 5. Service/controller conventions
- Controllers should be thin and delegate to services
- Services contain business logic and validation
- Repositories handle persistence only
- Use constructor injection with @RequiredArgsConstructor

## 6. Code style conventions observed
- Use English names where possible
- Use descriptive method names: createBook, getBookById, updateBookById, deleteBook
- Prefer ResponseEntity for controller responses
- Use exception classes for domain errors
- Keep mapping logic in mapper classes instead of controllers/services

## 7. Notes for future projects
- Prefer a clear layered structure: controller -> service -> repository
- Keep folder names consistent across projects
- Use DTOs for API layers and entities for persistence layers
- Avoid mixing business logic into controllers

## 8. Full project conventions to remember
- Use package names in lowercase, following domain structure such as com.example.project
- Keep each feature organized in a consistent folder layout
- Separate API contract objects from database entities
- Use interfaces for services so implementations can be swapped easily
- Put validation in service layer or request DTOs, not in controllers
- Handle errors with custom exceptions and meaningful messages
- Prefer immutable-style DTOs when possible, but Lombok builders are acceptable for convenience
- Keep controllers focused on HTTP concerns only
- Keep repositories focused on persistence concerns only
- Place mapping logic in mapper classes to reduce duplication
- Name methods according to action and domain: create, get, update, delete, search, count
- Follow consistent REST naming: /books, /books/{id}, /authors, /authors/{id}
- Use @RequestMapping and specific HTTP methods like @GetMapping, @PostMapping, @PutMapping, @DeleteMapping
- Use ResponseEntity for API response status and body
- Keep response payloads consistent with ApiResponse or typed response DTOs
- Use configuration classes for security, JWT, CORS, websocket, and cloud storage setup
- Keep environment settings in application.properties or application.yml

## 9. Example pattern to copy in future projects
- Controller: receives request, validates input, calls service
- Service: contains business rules and throws domain exceptions
- Repository: executes database operations
- Mapper: converts entity <-> DTO
- DTO: defines what the client receives/sends
- Entity: defines database structure
- Exception: describes business errors clearly

## 10. What matters most for future projects
- Consistency is more important than personal style
- Same naming pattern across all layers
- Clear separation of concerns
- Easy to extend and maintain
- Readable folder structure for teammates
