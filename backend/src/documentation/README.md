# Documentation API avec Swagger pour Xeption E-commerce

## Présentation

Ce dossier contient les ressources et guides nécessaires pour documenter l'API Xeption E-commerce avec Swagger/OpenAPI. Une documentation complète et précise est essentielle pour faciliter l'intégration frontend et le travail des partenaires.

## Contenu du dossier

Ce dossier contient trois ressources principales:

1. **[endpoint-documentation-examples.md](./endpoint-documentation-examples.md)** - Exemples détaillés de documentation d'endpoints pour chaque module (Marketing, RFQ, TradeIn, CartOrder)

2. **[swagger-implementation-guide.md](./swagger-implementation-guide.md)** - Guide d'implémentation pas à pas de Swagger dans le projet

3. **[dto-documentation-reference.md](./dto-documentation-reference.md)** - Référence complète pour documenter les différents types de DTOs avec exemples pour chaque module

## Guide rapide pour documenter un nouvel endpoint

1. Importez les décorateurs Swagger nécessaires:
```typescript
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody
} from '@nestjs/swagger';
```

2. Utilisez `@ApiTags` pour catégoriser votre contrôleur:
```typescript
@ApiTags('nom-du-module')
@Controller('nom-du-module')
export class MonController {}
```

3. Documentez chaque endpoint avec les décorateurs appropriés:
```typescript
@Get(':id')
@ApiOperation({ 
  summary: 'Titre court de l\'endpoint', 
  description: 'Description détaillée de l\'endpoint'
})
@ApiParam({ name: 'id', description: 'Description du paramètre' })
@ApiResponse({ status: 200, description: 'Succès', type: MonDto })
@ApiResponse({ status: 404, description: 'Ressource non trouvée' })
async getResource(@Param('id') id: string): Promise<MonDto> {
  // Implémentation
}
```

4. Pour les endpoints sécurisés, ajoutez `@ApiBearerAuth()`:
```typescript
@Post()
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Créer une ressource' })
@ApiBody({ type: CreateResourceDto })
@ApiResponse({ status: 201, description: 'Ressource créée', type: ResourceDto })
async createResource(@Body() dto: CreateResourceDto): Promise<ResourceDto> {
  // Implémentation
}
```

## Guide rapide pour documenter un nouveau DTO

1. Importez les décorateurs Swagger nécessaires:
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
```

2. Documentez chaque propriété du DTO:
```typescript
export class MonDto {
  @ApiProperty({
    description: 'Description de la propriété',
    example: 'Exemple de valeur',
    required: true
  })
  @IsString()
  propriete: string;

  @ApiPropertyOptional({
    description: 'Description de la propriété optionnelle',
    example: 'Exemple de valeur optionnelle'
  })
  @IsOptional()
  @IsString()
  proprieteOptionnelle?: string;
}
```

## Accès à la documentation Swagger

Une fois configurée, la documentation Swagger est accessible à l'URL:

```
http://localhost:3000/api-docs
```

## Validation de la documentation

Pour vérifier la qualité de votre documentation, vous pouvez:

1. Accéder à l'interface Swagger et tester les endpoints
2. Générer et valider le fichier OpenAPI JSON
3. Utiliser des outils comme Spectral pour valider la conformité au standard OpenAPI

## Ressources additionnelles

- [Documentation officielle NestJS sur Swagger](https://docs.nestjs.com/openapi/introduction)
- [Spécification OpenAPI](https://spec.openapis.org/oas/latest.html)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

## Remarques importantes

- La documentation doit être mise à jour en même temps que le code
- Assurez-vous que les exemples fournis sont réalistes et cohérents
- Documentez toujours les erreurs possibles avec les codes HTTP appropriés
- Maintenez une cohérence dans le style et la structure de la documentation

Pour plus de détails, consultez les documents individuels dans ce dossier.