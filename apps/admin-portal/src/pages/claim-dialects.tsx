/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { AddDialect, DialectSearch } from "../components";
import { AlertLevels, AppConfigInterface, ClaimDialect } from "../models";
import { AppConfig, history } from "../helpers";
import { ClaimsAvatarBackground, ClaimsList, ListType } from "../components";
import { UserConstants, LOCAL_CLAIMS_PATH } from "../constants";
import { Divider, DropdownProps, Grid, Icon, Image, List, PaginationProps, Popup, Segment } from "semantic-ui-react";
import { filterList, sortList } from "../utils";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { addAlert } from "@wso2is/core/store";
import { getDialects } from "../api";
import { ListLayout } from "../layouts";
import { PageLayout } from "../layouts";
import { PrimaryButton } from "@wso2is/react-components";
import { useDispatch } from "react-redux";

/**
 * This displays a list fo claim dialects.
 *
 * @return {ReactElement}
 */
export const ClaimDialectsPage = (): ReactElement => {

    /**
     * Sets the attributes by which the list can be sorted.
     */
    const SORT_BY = [
        {
            key: 0,
            text: "Dialect URI",
            value: "dialectURI"
        }
    ];

    const [ dialects, setDialects ] = useState<ClaimDialect[]>(null);
    const [ offset, setOffset ] = useState(0);
    const [ listItemLimit, setListItemLimit ] = useState<number>(0);
    const [ addEditClaim, setAddEditClaim ] = useState(false);
    const [ filteredDialects, setFilteredDialects ] = useState<ClaimDialect[]>(null);
    const [ sortBy, setSortBy ] = useState(SORT_BY[ 0 ]);
    const [ sortOrder, setSortOrder ] = useState(true);
    const [ localURI, setLocalURI ] = useState("");

    const appConfig: AppConfigInterface = useContext(AppConfig);

    const dispatch = useDispatch();

    /**
     * Fetches all the dialects.
     *
     * @param {number} limit.
     * @param {number} offset.
     * @param {string} sort.
     * @param {string} filter.
     */
    const getDialect = (limit?: number, offset?: number, sort?: string, filter?: string): void => {
        getDialects({
            filter,
            limit,
            offset,
            sort
        }).then((response: ClaimDialect[]) => {
            const filteredDialect: ClaimDialect[] = response.filter((claim: ClaimDialect) => {
                if (claim.id === "local") {
                    setLocalURI(claim.dialectURI);
                }
                return claim.id !== "local";
            });

            setDialects(filteredDialect);
            setFilteredDialects(filteredDialect);
        }).catch(error => {
            dispatch(addAlert(
                {
                    description: error?.description || "There was an error while getting the dialects",
                    level: AlertLevels.ERROR,
                    message: error?.message || "Something went wrong"
                }
            ));
        })
    };

    useEffect(() => {
        setListItemLimit(UserConstants.DEFAULT_USER_LIST_ITEM_LIMIT);
        getDialect();
    }, []);

    useEffect(() => {
        setFilteredDialects(sortList(filteredDialects, sortBy.value, sortOrder));
    }, [ sortBy, sortOrder ]);

    /**
     * This slices a portion of the list to display.
     *
     * @param {ClaimDialect[]} list.
     * @param {number} limit.
     * @param {number} offset.
     *
     * @return {ClaimDialect[]} Paginated List.
     */
    const paginate = (list: ClaimDialect[], limit: number, offset: number): ClaimDialect[] => {
        return list?.slice(offset, offset + limit);
    };

    /**
     * Handles change in the number of items to show.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event.
     * @param {data} data.
     */
    const handleItemsPerPageDropdownChange = (
        event: React.MouseEvent<HTMLAnchorElement>, data: DropdownProps
    ): void => {
        setListItemLimit(data.value as number);
    };

    /**
     * Paginates.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event.
     * @param {PaginationProps} data.
     */
    const handlePaginationChange = (event: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
        setOffset((data.activePage as number - 1) * listItemLimit);
    };

    /**
     * Handle sort strategy change.
     *
     * @param {React.SyntheticEvent<HTMLElement>} event.
     * @param {DropdownProps} data.
     */
    const handleSortStrategyChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        setSortBy(SORT_BY.filter(option => option.value === data.value)[ 0 ]);
    };

    /**
     * Handles sort order change.
     *
     * @param {boolean} isAscending.
     */
    const handleSortOrderChange = (isAscending: boolean) => {
        setSortOrder(isAscending);
    };

    return (
        <>
            <AddDialect
                open={ addEditClaim }
                onClose={ () => {
                    setAddEditClaim(false);
                } }
                update={ getDialect }
            />
            <PageLayout
                title="Claim Dialects"
                description="Create and manage claim dialects"
                showBottomDivider={ true }
            >
                {
                    appConfig?.claimDialects?.features?.localClaims?.permissions?.read &&
                    (
                        <Segment>
                            <List>
                                <List.Item>
                                    <Grid>
                                        <Grid.Row columns={ 2 }>
                                            <Grid.Column width={ 12 }>
                                                <Image
                                                    floated="left"
                                                    verticalAlign="middle"
                                                    rounded
                                                    centered
                                                    size="mini"
                                                >
                                                    <ClaimsAvatarBackground primary />
                                                    <span className="claims-letter">
                                                        L
                                                    </span>
                                                </Image>
                                                <List.Header>
                                                    Local Dialect
                                                </List.Header>
                                                <List.Description>
                                                    { localURI }
                                                </List.Description>
                                            </Grid.Column>
                                            <Grid.Column width={ 4 } verticalAlign="middle" textAlign="right">
                                                <Popup
                                                    inverted
                                                    trigger={
                                                        <Icon
                                                            link
                                                            name="arrow right"
                                                            onClick={ () => {
                                                                history.push(LOCAL_CLAIMS_PATH);
                                                            } }
                                                        />
                                                    }
                                                    position="top center"
                                                    content="View local claims"
                                                />
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </List.Item>
                            </List>
                        </Segment>
                    )
                }
                <Divider hidden />
                <ListLayout
                    advancedSearch={
                        <DialectSearch onFilter={ (query) => {
                            // TODO: getDialect(null, null, null, query);
                            try {
                                const filteredDialects = filterList(dialects, query, sortBy.value, sortOrder);
                                setFilteredDialects(filteredDialects);
                            } catch (error) {
                                dispatch(addAlert({
                                    description: error.message,
                                    level: AlertLevels.ERROR,
                                    message: "Filter query format incorrect"
                                }));
                            }
                        } } />
                    }
                    currentListSize={ listItemLimit }
                    listItemLimit={ listItemLimit }
                    onItemsPerPageDropdownChange={ handleItemsPerPageDropdownChange }
                    onPageChange={ handlePaginationChange }
                    onSortStrategyChange={ handleSortStrategyChange }
                    onSortOrderChange={ handleSortOrderChange }
                    rightActionPanel={
                        appConfig?.claimDialects?.permissions?.create && (
                            <PrimaryButton
                                onClick={ () => {
                                    setAddEditClaim(true);
                                } }
                            >
                                <Icon name="add" />New External Dialect
                            </PrimaryButton>
                        )
                    }
                    showPagination={ true }
                    sortOptions={ SORT_BY }
                    sortStrategy={ sortBy }
                    totalPages={ Math.ceil(filteredDialects?.length / listItemLimit) }
                    totalListSize={ filteredDialects?.length }
                >
                    <ClaimsList
                        list={ paginate(filteredDialects, listItemLimit, offset) }
                        localClaim={ ListType.DIALECT }
                        update={ getDialect }
                    />
                </ListLayout>
            </PageLayout>
        </>
    );
};
