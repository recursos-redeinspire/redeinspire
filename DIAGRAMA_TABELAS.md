# 🗄️ Diagrama de Tabelas — Plataforma Rede Inspire

> DynamoDB — Região: us-east-1

---

## Diagrama Entidade-Relacionamento (Mermaid)

```mermaid
erDiagram
    USERS {
        string id PK
        string name
        string email
        string password
        string role "admin | pastor_presidente | lider"
        string churchId FK
        list ministries "array de nomes"
        string photoUrl "base64 Data URL"
        string birthDate
        string preferredLang "pt | en | es | fr"
        string status "active | blocked"
        boolean firstLogin
        number points "gamificação"
    }

    CHURCHES {
        string id PK
        string name
        string pastorName
        string pastorId FK
        string cep
        string address
        string city
        string state
        number lat
        number lng
        number memberCount
        string phone
        string logoUrl "base64 Data URL"
        string themeColor "hex color"
        number engagementScore
    }

    MINISTRIES {
        string id PK
        string name
        string description
        string leaderId FK
        string leaderName
        string churchId FK
        string createdAt
        string createdBy FK
    }

    CONTENT {
        string id PK
        string title
        string description
        string categorySlug
        string type
        number durationMinutes
        string thumbnailUrl
        string contentUrl
        string createdAt
        string createdBy FK
        string createdByName
        number popularity
        number views
    }

    TRAILS {
        string id PK
        string title
        string description
        list modules "array de objetos"
        number points
        boolean isMandatory
        number totalDurationMinutes
        string createdAt
        string createdBy FK
    }

    TRAIL_PROGRESS {
        string id PK
        string trailId FK
        string userId FK
        list completedModules "array de moduleId"
        number percentComplete
        string startedAt
        string completedAt
    }

    MESSAGES {
        string id PK
        string fromUserId FK
        string fromName
        string toUserId FK
        string subject
        string body
        boolean isRead
        string createdAt
        string groupName "opcional - Administradores"
    }

    WEBINARS {
        string id PK
        string title
        string description
        string scheduledAt
        string meetingUrl
        string hostName
        string createdBy FK
        list enrolledUsers "array de userId"
        number enrolledCount
    }

    MENTORING {
        string id PK
        string title
        string description
        string scheduledAt
        string meetingUrl
        string mentorName
        string mentorId FK
        string pastorName
        string pastorId FK
        string status "scheduled | completed"
        string createdBy FK
    }

    PLANS {
        string id PK
        string userId FK
        string type "webinar | custom"
        string title
        map data "objeto livre"
        string createdAt
        string updatedAt
    }

    PODCAST {
        string id PK
        string title
        string description
        string audioUrl
        string publishedAt
    }

    PODCAST_PROGRESS {
        string id PK
        string episodeId FK
        string userId FK
        number currentTime
        boolean completed
    }

    TIMELINE {
        string id PK
        string title
        string description
        string date
    }

    MATERIALS {
        string id PK
        string title
        string description
        string fileUrl "URL S3"
        string type "pdf | doc | image | other"
        string category
        string createdAt
        string createdBy FK
        string createdByName
    }

    %% ===== RELACIONAMENTOS =====

    USERS }o--|| CHURCHES : "pertence a"
    CHURCHES ||--o{ USERS : "tem membros"

    MINISTRIES }o--|| CHURCHES : "pertence a"
    MINISTRIES }o--o| USERS : "liderado por"

    CONTENT }o--o| USERS : "criado por"

    TRAILS }o--o| USERS : "criado por"

    TRAIL_PROGRESS }o--|| TRAILS : "progresso em"
    TRAIL_PROGRESS }o--|| USERS : "pertence a"

    MESSAGES }o--|| USERS : "enviada por (from)"
    MESSAGES }o--|| USERS : "enviada para (to)"

    WEBINARS }o--o| USERS : "criado por"
    WEBINARS }o--o{ USERS : "inscritos"

    MENTORING }o--o| USERS : "mentor"
    MENTORING }o--o| USERS : "pastor"

    PLANS }o--|| USERS : "pertence a"

    PODCAST_PROGRESS }o--|| PODCAST : "progresso em"
    PODCAST_PROGRESS }o--|| USERS : "pertence a"

    MATERIALS }o--o| USERS : "criado por"
```

---

## Detalhamento dos Módulos (dentro de Trails)

```mermaid
erDiagram
    TRAILS ||--o{ MODULE : "contém"
    MODULE {
        string moduleId PK
        string title
        number order
        number durationMinutes
        string contentId FK "ref Content.id"
    }
    MODULE }o--o| CONTENT : "vinculado a"
```

---

## Resumo das Tabelas

| # | Tabela DynamoDB | PK | Registros Típicos |
|---|----------------|----|--------------------|
| 1 | `RedeInspire-Users` | `id` | Usuários (admin, pastores, líderes) |
| 2 | `RedeInspire-Churches` | `id` | Igrejas filiadas à rede |
| 3 | `RedeInspire-Ministries` | `id` | Ministérios das igrejas |
| 4 | `RedeInspire-Content` | `id` | Conteúdos (vídeos, PDFs, artigos) |
| 5 | `RedeInspire-Trails` | `id` | Trilhas de capacitação |
| 6 | `RedeInspire-TrailProgress` | `id` | Progresso de usuários nas trilhas |
| 7 | `RedeInspire-Messages` | `id` | Mensagens entre usuários |
| 8 | `RedeInspire-Webinars` | `id` | Webinars agendados |
| 9 | `RedeInspire-Mentoring` | `id` | Sessões de mentoria |
| 10 | `RedeInspire-Plans` | `id` | Planejamentos pessoais |
| 11 | `RedeInspire-Podcast` | `id` | Episódios de podcast |
| 12 | `RedeInspire-PodcastProgress` | `id` | Progresso de escuta |
| 13 | `RedeInspire-Timeline` | `id` | Eventos da timeline |
| 14 | `RedeInspire-Materials` | `id` | Materiais para download |

---

## Fluxo de Dados Principais

```mermaid
flowchart LR
    U[Usuário] -->|login| AUTH[Auth/JWT]
    AUTH -->|token| API[Lambda rede-inspire-api]

    API --> USERS[(Users)]
    API --> CHURCHES[(Churches)]
    API --> CONTENT[(Content)]
    API --> TRAILS[(Trails)]
    API --> PROGRESS[(TrailProgress)]
    API --> MSGS[(Messages)]
    API --> WEBINARS[(Webinars)]
    API --> MENTORING[(Mentoring)]
    API --> PLANS[(Plans)]
    API --> PODCAST[(Podcast)]
    API --> MINISTRIES[(Ministries)]
    API --> MATERIALS[(Materials)]

    USERS -.->|churchId| CHURCHES
    PROGRESS -.->|trailId| TRAILS
    PROGRESS -.->|userId| USERS
    MSGS -.->|fromUserId/toUserId| USERS
    MINISTRIES -.->|churchId| CHURCHES
```
