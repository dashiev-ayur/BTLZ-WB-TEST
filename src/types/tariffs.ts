export interface IResponseTariffsBox {
    dtNextBox: string;
    dtTillMax: string;
    warehouseList: ITariffsBoxWarehouse[];
}

export interface ITariffsBoxWarehouse {
    boxDeliveryBase: string;
    boxDeliveryCoefExpr: string;
    boxDeliveryLiter: string;
    boxDeliveryMarketplaceBase: string;
    boxDeliveryMarketplaceCoefExpr: string;
    boxDeliveryMarketplaceLiter: string;
    boxStorageBase: string;
    boxStorageCoefExpr: string;
    boxStorageLiter: string;
    geoName: string;
    warehouseName: string;
}

export interface ITariffsBox extends IResponseTariffsBox {
    dtUpdate: Date;
}

export interface IUpdateTariffs {
    commission?: null; // TODO: Implement commission
    box?: ITariffsBox;
    pallet?: null; // TODO: Implement pallet
    return?: null; // TODO: Implement return
}