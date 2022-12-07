import { ITiledMapProperty } from '@workadventure/tiled-map-type-guard';
import { EntityData } from '../types';
import type { GameMap } from './GameMap';

export class GameMapEntities {

    private gameMap: GameMap;

    private entities: EntityData[] = [];

    private nextEntityId: number = 0;

    private readonly MAP_PROPERTY_ENTITIES_NAME: string = 'entities';

    constructor(gameMap: GameMap) {
        this.gameMap = gameMap;

        for (const entityData of JSON.parse(JSON.stringify(this.getEntitiesMapProperty()?.value ?? [])) as EntityData[] ?? []) {
            this.addEntity(entityData, false);
        };
    }

    public addEntity(entityData: EntityData, addToMapProperties: boolean = true): boolean {
        if (this.entities.find(entity => entity.id === entityData.id)) {
            return false;
        }
        this.entities.push(entityData);
        this.nextEntityId = Math.max(this.nextEntityId, entityData.id);
        if (addToMapProperties) {
            return this.addEntityToMapProperties(entityData);
        }
        return true;
    }

    public getEntity(id: number): EntityData | undefined {
        return this.entities.find(entity => entity.id === id);
    }

    public deleteEntity(id: number): boolean {
        const index = this.entities.findIndex(entityData => entityData.id === id);
        if (index !== -1) {
            this.entities.splice(index, 1);
            return this.deleteEntityFromMapProperties(id);
        }
        return false;
    }

    private addEntityToMapProperties(entityData: EntityData): boolean {
        if (this.gameMap.getMap().properties === undefined) {
            this.gameMap.getMap().properties = [];
        }
        if (!this.getEntitiesMapProperty()) {
            this.gameMap.getMap().properties?.push({
                name: this.MAP_PROPERTY_ENTITIES_NAME,
                type: "string",
                propertytype: "string",
                value: JSON.parse(JSON.stringify([])),
            });
        }
        const entitiesPropertyValues = JSON.parse(JSON.stringify(this.getEntitiesMapProperty()?.value)) as EntityData[];

        if (entitiesPropertyValues.find(entity => entity.id === entityData.id)) {
            console.warn(`ADD ENTITY FAIL: ENTITY OF ID ${entityData.id} ALREADY EXISTS WITHIN THE GAMEMAP!`);
            return false;
        }
        entitiesPropertyValues.push(entityData);

        const entitiesMapProperty = this.getEntitiesMapProperty();
        if (entitiesMapProperty !== undefined) {
            entitiesMapProperty.value = JSON.parse(JSON.stringify(entitiesPropertyValues));
        }

        return true;
    }

    private deleteEntityFromMapProperties(id: number): boolean {
        const entitiesPropertyValues = JSON.parse(JSON.stringify(this.getEntitiesMapProperty()?.value)) as EntityData[];
        const indexToRemove = entitiesPropertyValues.findIndex(entityData => entityData.id === id);
        if (indexToRemove !== -1) {
            entitiesPropertyValues.splice(indexToRemove, 1);
            const entitiesMapProperty = this.getEntitiesMapProperty();
            if (entitiesMapProperty !== undefined) {
                entitiesMapProperty.value = JSON.parse(JSON.stringify(entitiesPropertyValues));
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    private getEntitiesMapProperty(): ITiledMapProperty | undefined {
        return this.gameMap.getMap().properties?.find(property => property.name === this.MAP_PROPERTY_ENTITIES_NAME);
    }

    // private loadMockEntities(): EntityData[] {
    //     return [
    //         {
    //             id: 0,
    //             x: 320,
    //             y: 304,
    //             interactive: true,
    //             properties: {
    //                 jitsiRoom: {roomName : "ChillZone", buttonLabel :"Open Jitsi"},
    //                 playAudio: {audioLink : "../assets/audio/campfire.ogg", buttonLabel:"Play campfire sound"},
    //                 openTab: {link:"https://img-9gag-fun.9cache.com/photo/ay2DNzM_460svav1.mp4", buttonLabel:"Show me some kitties!"},
    //             },
    //             prefab:{
    //                 name:"table",
    //                 tags:["table"],
    //                 imagePath : "table",
    //                 collisionGrid: [
    //                     [0, 0],
    //                     [1, 1],
    //                     [1, 1],
    //                 ],
    //                 direction: Direction.Down,
    //                 color: "saddlebrown",
    //             }
    //         }
    //     ];
    // }

    public getEntities(): EntityData[] {
        return this.entities;
    }

    public getNextEntityId(): number {
        return this.nextEntityId + 1;
    }
}