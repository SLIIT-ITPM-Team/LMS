import React from "react";
import MaterialCard from "./MaterialCard";

const MaterialsGrid = ({ materials }) => {
	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
			{materials.map((material) => (
				<MaterialCard key={material.id} material={material} />
			))}
		</div>
	);
};

export default MaterialsGrid;
