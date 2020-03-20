import React from 'react';
import { Card } from 'ui/containers/DashboardTemplates/styled';

const TemplateCard = ({
  title,
  image,
  onSelect,
}) => (
  <Card onClick={onSelect}>
    <img
      src={image}
      alt={title} />
    <p>{title}</p>
  </Card>
);

export default React.memo(TemplateCard);
