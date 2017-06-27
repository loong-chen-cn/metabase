/* eslint "react/prop-types": "warn" */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { isQueryable } from "metabase/lib/table";

import S from "metabase/components/List.css";
import R from "metabase/reference/Reference.css";

import List from "metabase/components/List.jsx";
import ListItem from "metabase/components/ListItem.jsx";
import EmptyState from "metabase/components/EmptyState.jsx";


import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper.jsx";

import ReferenceHeader from "../components/ReferenceHeader.jsx";

import {
    getSection,
    getData,
    getHasSingleSchema,
    getError,
    getLoading
} from "../selectors";

import * as metadataActions from "metabase/redux/metadata";


const emptyStateData = {
            message: `Tables in this database will appear here as they're added`,
            icon: "table2"
        }

const mapStateToProps = (state, props) => ({
    section: getSection(state, props),
    entities: getData(state, props),
    hasSingleSchema: getHasSingleSchema(state, props),
    loading: getLoading(state, props),
    loadingError: getError(state, props)
});

const mapDispatchToProps = {
    ...metadataActions
};

const createListItem = (entity, index, section) =>
    <li className="relative" key={entity.id}>
        <ListItem
            id={entity.id}
            index={index}
            name={entity.display_name || entity.name}
            description={ entity.description }
            url={ `${section.id}/${entity.id}` }
            icon={ section.icon }
        />
    </li>;


const createSchemaSeparator = (entity) =>
    <li className={R.schemaSeparator}>{entity.schema}</li>;


const separateTablesBySchema = (
    tables,
    section,
    createSchemaSeparator,
    createListItem
) => Object.values(tables)
    .sort((table1, table2) => table1.schema > table2.schema ? 1 :
        table1.schema === table2.schema ? 0 : -1
    )
    .map((table, index, sortedTables) => {
        if (!table || !table.id || !table.name) {
            return;
        }
        // add schema header for first element and if schema is different from previous
        const previousTableId = Object.keys(sortedTables)[index - 1];
        return index === 0 ||
            sortedTables[previousTableId].schema !== table.schema ?
                [
                    createSchemaSeparator(table),
                    createListItem(table, index, section)
                ] :
                createListItem(table, index, section);
    });


@connect(mapStateToProps, mapDispatchToProps)
export default class TableList extends Component {
    static propTypes = {
        style: PropTypes.object.isRequired,
        entities: PropTypes.object.isRequired,
        section: PropTypes.object.isRequired,
        hasSingleSchema: PropTypes.bool,
        loading: PropTypes.bool,
        loadingError: PropTypes.object
    };

    render() {
        const {
            entities,
            style,
            section,
            hasSingleSchema,
            loadingError,
            loading
        } = this.props;

        return (
            <div style={style} className="full">
                <ReferenceHeader section={section} />
                <LoadingAndErrorWrapper loading={!loadingError && loading} error={loadingError}>
                { () => Object.keys(entities).length > 0 ?
                    <div className="wrapper wrapper--trim">
                        <List>
                            { !hasSingleSchema ?
                                separateTablesBySchema(
                                    entities,
                                    section,
                                    createSchemaSeparator,
                                    createListItem
                                ) :
                                Object.values(entities).filter(isQueryable).map((entity, index) =>
                                    entity && entity.id && entity.name &&
                                        createListItem(entity, index, section)
                                )
                            }
                        </List>
                    </div>
                    :
                    <div className={S.empty}>
                        <EmptyState {...emptyStateData}/>
                    </div>
                }
                </LoadingAndErrorWrapper>
            </div>
        )
    }
}
