import { Parcel } from "./parcel";
import { Service } from "./service";

export const parcels: Parcel[] = [];

const section = ui.createProjectPanelSection();
section.add(new ui.Paragraph('Click on the map to view property infos'));

const container = new ui.Container();
section.add(container);

section.add(new ui.Button('Export all as GeoJSON', () => {
    const file = File.fromString('parcels.json', JSON.stringify({
        type: 'FeatureCollection',
        features: parcels.map(parcel => ({
            type: 'Feature',
            properties: {
                name: parcel.egrid
            },
            geometry: parcel.toGeoJson()
        }))
    }, null, '\t'));

    ui.download(file);
}));

section.add(new ui.Separator());
section.add(new ui.Paragraph(`Data is sourced from the official geospacial department of the Swiss Confederation, available publicly at ${Service.api}`));

const layer = new map.layer.WMSLayer('öreb', Service.map.url, Service.map.layer, Service.map.parameters);
layer.hide(); 

const keepMapToggle = new ui.Checkbox('Keep map when closing plugin', false);
section.add(keepMapToggle);

const keepMapStorageKey = 'keep-map';

Storage.user.read(keepMapStorageKey).then(keep => keepMapToggle.value = keep || false);
keepMapToggle.onValueChange.subscribe(keep => Storage.user.write(keepMapStorageKey, keep));

layer.onPositionSelect.subscribe(position => {
    for (let parcel of parcels) {
        for (let polygon of parcel.polygons || []) {
            if (position.inside(polygon)) {
                parcel.remove();
                
                return;
            }
        }
    }

    const parcel = new Parcel(position);
    parcel.append(container);

    parcels.push(parcel);
});

section.onOpen.subscribe(() => {
    layer.show(); 
});

section.onClose.subscribe(() => {
    if (keepMapToggle.value) {
        return;
    }

    layer.hide();

    while (parcels.length) {
        const parcel = parcels.pop();

        for (let element of parcel.elements) {
            element.remove();
        }
    }
});