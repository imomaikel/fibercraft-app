type TItemWrapper = {
  children: React.ReactNode;
  title: string;
  description?: string;
};
const ItemWrapper = ({ children, title, description }: TItemWrapper) => {
  return (
    <div className="flex flex-col">
      <div className="mb-1">
        <h2 className="text-xl font-semibold capitalize">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
};

export default ItemWrapper;
