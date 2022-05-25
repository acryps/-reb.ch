import { Parcel } from "./parcel";
import { Service } from "./service";

const elements: (map.Line | map.ColoredArea)[] = [];
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
section.add(new ui.Paragraph(`Data is sourced from the official geospacial department of the Swiss Confederation, available publicly at ${Service.api} and ${Service.map.url}`));

const layer = new map.layer.WMSLayer('ACRYPS KATASTER', Service.map.url, Service.map.layer, Service.map.parameters);
layer.hide(); 

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
    layer.hide();

    while (elements.length) {
        elements.pop().remove();
    }
});