/* eslint "react/prop-types": "warn" */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { isQueryable } from "metabase/lib/table";

import S from "metabase/components/List.css";

import List from "metabase/components/List.jsx";
import ListItem from "metabase/components/ListItem.jsx";
import AdminAwareEmptyState from "metabase/components/AdminAwareEmptyState.jsx";

import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper.jsx";

import ReferenceHeader from "../components/ReferenceHeader.jsx";

import {
    getSection,
    getData,
    getError,
    getLoading
} from "../selectors";

import * as metadataActions from "metabase/redux/metadata";

const emptyStateData = {
            title: "Metabase is no fun without any data",
            adminMessage: "Your databses will appear here once you connect one",
            message: "Databases will appear here once your admins have added some",
            image: "app/assets/img/databases-list",
            adminAction: "Connect a database",
            adminLink: "/admin/databases/create"
        }

const mapStateToProps = (state, props) => ({
    section: getSection(state, props),
    entities: getData(state, props),
    loading: getLoading(state, props),
    loadingError: getError(state, props)
});

const mapDispatchToProps = {
    ...metadataActions
};


@connect(mapStateToProps, mapDispatchToProps)
export default class DatabaseList extends Component {
    static propTypes = {
        style: PropTypes.object.isRequired,
        entities: PropTypes.object.isRequired,
        section: PropTypes.object.isRequired,
        loading: PropTypes.bool,
        loadingError: PropTypes.object
    };

    render() {
        const {
            entities,
            style,
            section,
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
                            { 
                                Object.values(entities).filter(isQueryable).map((entity, index) =>
                                    entity && entity.id && entity.name &&
                                          <li className="relative" key={entity.id}>
                                            <ListItem
                                                id={entity.id}
                                                index={index}
                                                name={entity.display_name || entity.name}
                                                description={ entity.description }
                                                url={ `${section.id}/${entity.id}` }
                                                icon={ section.icon }
                                            />
                                        </li>
                                )
                            }
                        </List>
                    </div>
                    :
                    <div className={S.empty}>
                        <AdminAwareEmptyState {...emptyStateData}/>
                    </div>
                }
                </LoadingAndErrorWrapper>
            </div>
        )
    }
}
