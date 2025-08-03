# Architecture Hexagonale dans le Projet Xeption E-commerce

## Sommaire
1. [Introduction à l'Architecture Hexagonale](#introduction-à-larchitecture-hexagonale)
2. [Structure du Projet](#structure-du-projet)
3. [Couche Domaine](#couche-domaine)
4. [Couche Application](#couche-application)
5. [Couche Infrastructure](#couche-infrastructure)
6. [Couche Interface](#couche-interface)
7. [Flux de Données](#flux-de-données)
8. [Avantages dans le Contexte E-commerce](#avantages-dans-le-contexte-e-commerce)
9. [Exemples Concrets du Projet](#exemples-concrets-du-projet)
10. [Tests et Architecture Hexagonale](#tests-et-architecture-hexagonale)

## Introduction à l'Architecture Hexagonale

L'Architecture Hexagonale, également connue sous le nom de "Ports and Adapters" ou "Onion Architecture", est un modèle d'architecture logicielle qui vise à créer des applications dont les composants métier sont indépendants des services qu'ils utilisent.

### Principes Fondamentaux

1. **Séparation des préoccupations**: Isoler clairement les différentes parties de l'application.
2. **Indépendance du domaine**: La logique métier ne doit pas dépendre des détails techniques.
3. **Dépendances vers l'intérieur**: Les dépendances pointent toujours vers le centre (domaine).
4. **Substituabilité**: Les composants externes peuvent être remplacés sans modifier le code métier.

![Architecture Hexagonale](https://miro.medium.com/max/700/1*LmOImsxXCdImFQK9Ej9S4Q.png)

## Structure du Projet

Le projet Xeption E-commerce est structuré selon l'architecture hexagonale avec les couches suivantes:

```
backend/
├── src/
│   ├── domain/           # Cœur métier - Entités et interfaces (ports)
│   ├── application/      # Cas d'utilisation - Orchestration du domaine
│   ├── infrastructure/   # Adaptateurs pour les services externes
│   │   ├── prisma/       # Implémentation des repositories avec Prisma
│   │   └── supabase/     # Implémentation des repositories avec Supabase
│   └── modules/          # Adaptateurs d'interface (contrôleurs NestJS)
```

## Couche Domaine

La couche domaine (`domain/`) est le cœur de l'application. Elle contient:

### Entités

Les entités représentent les concepts métier fondamentaux:

```typescript
// Exemple: domain/users/user.entity.ts
export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  // ...
  
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
  
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

### Ports (Interfaces)

Les ports définissent les contrats pour interagir avec le domaine:

```typescript
// Exemple: domain/auth/auth.port.ts
export interface AuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  validateCredentials(email: string, password: string): Promise<boolean>;
  generateToken(user: User): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
```

La couche domaine est totalement indépendante des frameworks, bases de données ou autres technologies.

## Couche Application

La couche application (`application/`) contient les cas d'utilisation qui orchestrent les entités du domaine pour accomplir des tâches spécifiques:

```typescript
// Exemple: application/marketing/create-banner.use-case.ts
@Injectable()
export class CreateBannerUseCase {
  constructor(
    @Inject(MARKETING_REPOSITORY)
    private marketingRepository: MarketingRepository,
  ) {}

  async execute(params: CreateBannerParams): Promise<Banner> {
    // Validation des paramètres d'entrée
    if (!params.imageUrl || !params.title) {
      throw new BadRequestException('Image URL and title are required');
    }

    // Création de la bannière via le repository
    const banner = await this.marketingRepository.createBanner({
      title: params.title,
      imageUrl: params.imageUrl,
      linkUrl: params.linkUrl,
      startDate: params.startDate,
      endDate: params.endDate,
      isActive: params.isActive ?? true,
    });

    return banner;
  }
}
```

Les cas d'utilisation dépendent uniquement du domaine, pas des détails d'implémentation.

## Couche Infrastructure

La couche infrastructure (`infrastructure/`) implémente les adaptateurs pour les services externes comme les bases de données:

```typescript
// Exemple: infrastructure/prisma/repositories/auth.repository.ts
@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    
    return user ? this.mapToEntity(user) : null;
  }
  
  // Autres méthodes d'implémentation...
  
  private mapToEntity(prismaUser: PrismaUser): User {
    // Conversion du modèle Prisma en entité de domaine
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      // ...
    };
  }
}
```

Cette couche contient les adaptateurs qui implémentent les interfaces (ports) définies dans le domaine.

## Couche Interface

La couche interface (`modules/`) contient les adaptateurs qui exposent les fonctionnalités de l'application au monde extérieur:

```typescript
// Exemple: modules/marketing/marketing.controller.ts
@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly createBannerUseCase: CreateBannerUseCase,
    private readonly getBannersUseCase: GetBannersUseCase,
  ) {}

  @Post('banners')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  async createBanner(
    @Body() createBannerDto: CreateBannerDto,
  ): Promise<BannerResponse> {
    const banner = await this.createBannerUseCase.execute(createBannerDto);
    return this.mapToResponse(banner);
  }
  
  @Get('banners')
  async getBanners(): Promise<BannerResponse[]> {
    const banners = await this.getBannersUseCase.execute();
    return banners.map(banner => this.mapToResponse(banner));
  }
  
  private mapToResponse(banner: Banner): BannerResponse {
    // Conversion de l'entité en format de réponse API
    return {
      id: banner.id,
      title: banner.title,
      // ...
    };
  }
}
```

## Flux de Données

Le flux de données dans l'architecture hexagonale suit généralement ces étapes:

1. **Entrée**: Une requête arrive au contrôleur (adaptateur d'entrée)
2. **Mappage**: Le contrôleur convertit les données de requête en format compréhensible par les cas d'utilisation
3. **Exécution**: Le cas d'utilisation orchestre les entités du domaine et utilise les ports (interfaces) pour interagir avec les services externes
4. **Stockage/Récupération**: Les adaptateurs de sortie (repositories) interagissent avec les systèmes externes
5. **Retour**: Les données remontent à travers les couches, avec conversion de format à chaque frontière

## Avantages dans le Contexte E-commerce

L'architecture hexagonale offre plusieurs avantages pour un système e-commerce:

1. **Évolutivité**: Facilite l'ajout de nouvelles fonctionnalités (nouveaux modules, nouveaux canaux de vente)
2. **Testabilité**: Les règles métier peuvent être testées indépendamment des bases de données ou APIs
3. **Flexibilité technologique**: Possibilité de changer de base de données, framework ou service externe sans impacter la logique métier
4. **Maintenabilité**: Organisation claire du code, séparation des responsabilités
5. **Adaptabilité**: Capacité à s'adapter rapidement aux changements du marché e-commerce

## Exemples Concrets du Projet

### Module Panier/Commande

Le module panier/commande illustre bien l'architecture hexagonale:

1. **Domaine**: 
   - Entités: `Cart`, `CartItem`, `Order`
   - Ports: `CartOrderRepository`

2. **Application**:
   - Cas d'utilisation: `CreateCartUseCase`, `AddCartItemUseCase`, `CreateOrderUseCase`

3. **Infrastructure**:
   - Adaptateurs: `PrismaCartOrderRepository`

4. **Interface**:
   - Contrôleur: `CartOrderController`
   - DTOs: `CreateCartDto`, `AddCartItemDto`, `CreateOrderDto`

### Flux de création d'une commande

1. Le client envoie une requête POST à `/cartorder/orders`
2. Le `CartOrderController` valide les données et appelle `CreateOrderUseCase`
3. `CreateOrderUseCase` applique la logique métier et utilise `CartOrderRepository`
4. `PrismaCartOrderRepository` persiste la commande dans la base de données
5. Le résultat remonte jusqu'au contrôleur qui transforme l'entité en réponse API

## Tests et Architecture Hexagonale

L'architecture hexagonale facilite grandement les tests:

### Tests Unitaires
Testent la logique métier pure, en utilisant des mocks pour les ports:

```typescript
describe('CreateCartUseCase', () => {
  let useCase: CreateCartUseCase;
  let repository: CartOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCartUseCase,
        {
          provide: CART_ORDER_REPOSITORY,
          useValue: mockCartOrderRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCartUseCase>(CreateCartUseCase);
    repository = module.get<CartOrderRepository>(CART_ORDER_REPOSITORY);
  });

  it('devrait créer un nouveau panier si aucun n\'existe', async () => {
    // Test du cas d'utilisation avec repository mocké
  });
});
```

### Tests d'Intégration
Testent l'interaction entre les composants, généralement au niveau des contrôleurs:

```typescript
describe('CartOrderController', () => {
  let controller: CartOrderController;
  let cartOrderService: CartOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartOrderController],
      providers: [
        {
          provide: CartOrderService,
          useValue: mockCartOrderService,
        },
      ],
    }).compile();

    controller = module.get<CartOrderController>(CartOrderController);
    cartOrderService = module.get<CartOrderService>(CartOrderService);
  });

  it('should create a cart', async () => {
    // Test du contrôleur avec service mocké
  });
});
```

## Conclusion

L'architecture hexagonale dans le projet Xeption E-commerce offre une séparation claire des responsabilités, facilitant le développement, les tests et la maintenance. Cette approche architecturale est particulièrement adaptée aux systèmes complexes comme les plateformes e-commerce qui nécessitent flexibilité et robustesse.

Les principaux avantages observés sont:
- Isolation de la logique métier
- Indépendance vis-à-vis des frameworks
- Facilité de test
- Adaptabilité aux changements technologiques
- Structure claire et cohérente du code

Cette architecture permet au projet de s'adapter facilement aux évolutions du marché e-commerce tout en maintenant une base de code solide et testable.