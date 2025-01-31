module.exports = ({
    _,
    commentIfDeactivated,
    assignTemplates,
    templates,
    getNamePrefixedWithSchemaName,
    wrapInQuotes,
}) => {
    const getPlainUdt = (udt, getColumnDefinition) => {
        const udtName = getNamePrefixedWithSchemaName(udt.name, udt.schemaName);
        switch (udt.type) {
            case 'OBJECT_UDT':
                return assignTemplates(templates.createObjectType, {
                    name: udtName,
                    properties: _.map(udt.properties, (prop) => getColumnDefinition(prop, templates.objectTypeColumnDefinition)).join(',\n\t'),
                });
            case 'VARRAY':
            case 'TABLE':
                const defaultSize = udt.type === 'VARRAY' ? '(64)' : '';
                return assignTemplates(templates.createCollectionType, {
                    name: udtName,
                    collectionType: udt.type,
                    size: _.isNumber(udt.size) ? `(${udt.size})` : defaultSize,
                    datatype: `${udt.ofType}${udt.nullable ? '' : ' NOT NULL'}`,
                    notPersistable: `${udt.notPersistable ? ' NOT PERSISTABLE' : ''}`,
                });
            default:
                return '';
        }
    };

    const getUserDefinedType = (udt, columns) => {
        return commentIfDeactivated(getPlainUdt(udt, columns), {
            isActivated: udt.isActivated,
        });
    };

    return { getUserDefinedType };
};
