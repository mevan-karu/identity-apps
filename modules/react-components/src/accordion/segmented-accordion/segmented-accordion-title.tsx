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

import {
    Accordion,
    AccordionTitleProps,
    Checkbox,
    CheckboxProps,
    Grid,
    Icon,
    Popup,
    Segment,
    SemanticICONS
} from "semantic-ui-react";
import { GenericIcon, GenericIconProps } from "../../icon";
import React, { FormEvent, FunctionComponent, MouseEvent, ReactElement } from "react";
import classNames from "classnames";

/**
 * Proptypes for the segmented accordion title component.
 */
export interface SegmentedAccordionTitlePropsInterface extends AccordionTitleProps {
    /**
     * Unique identifier for the element to be used in action callbacks.
     */
    id?: string;
    /**
     * Set of actions for the panel.
     */
    actions?: SegmentedAccordionTitleActionInterface[];
    /**
     * Clearing
     */
    clearing?: boolean;
}

/**
 * Segmented accordion title action interface.
 */
export interface SegmentedAccordionTitleActionInterface extends StrictSegmentedAccordionTitleActionInterface {
    [ key: string ]: any;
}

/**
 * Strict Segmented accordion title action interface.
 */
export interface StrictSegmentedAccordionTitleActionInterface {
    /**
     * Type of the action to render the component.
     */
    type: "checkbox" | "toggle" | "icon";
    /**
     * On change callback.
     *
     * @param {React.FormEvent<HTMLInputElement> | React.MouseEvent<HTMLDivElement>} e - Change event.
     * @param data - Other arguments.
     */
    onChange?: (e: FormEvent<HTMLInputElement>, ...data) => void;
    /**
     * On click callback for the action.
     *
     * @param {React.FormEvent<HTMLInputElement> | React.MouseEvent<HTMLDivElement>} e - Click event.
     * @param data - Other arguments.
     */
    onClick?: (e: MouseEvent<HTMLDivElement>, ...data) => void;
    /**
     * Icon for the action. Only applicable for `type="icon"`.
     */
    icon?: SemanticICONS | GenericIconProps;
    /**
     * Label for the action.
     */
    label?: string;
    /**
     * Text for the popover.
     */
    popoverText?: string;
}

/**
 * Segmented accordion title component.
 *
 * @param {SegmentedAccordionTitlePropsInterface} props - Props injected to the component.
 * @return {ReactElement}
 */
export const SegmentedAccordionTitle: FunctionComponent<SegmentedAccordionTitlePropsInterface> = (
    props: SegmentedAccordionTitlePropsInterface
): ReactElement => {

    const {
        active,
        actions,
        attached,
        children,
        className,
        clearing,
        content,
        id,
        ...rest
    } = props;

    const classes = classNames(
        "segmented-accordion-title",
        {
            clearing
        },
        className
    );

    /**
     * Interferes the click events to stop default propagation.
     *
     * @param callback - onClick or onChange callback.
     * @param {React.SyntheticEvent} e - Event.
     * @param args - Other arguments.
     */
    const handleActionOnClick = (
        callback: (e: FormEvent<HTMLInputElement> | MouseEvent<HTMLDivElement>, ...data) => void,
        e: FormEvent<HTMLInputElement> | MouseEvent<HTMLDivElement>,
        ...args): void => {

        e.stopPropagation();
        callback(e, ...args);
    };

    /**
     * Resolve the action.
     *
     * @param {SegmentedAccordionTitleActionInterface} action - Passed in action.
     * @return {React.ReactElement} Resolved action.
     */
    const resolveAction = (action: SegmentedAccordionTitleActionInterface): ReactElement => {

        const {
            icon,
            label,
            onChange,
            onClick,
            popoverText,
            type,
            ...actionsRest
        } = action;

        switch (type) {
            case "toggle": {
                return (
                    <Checkbox
                        toggle
                        label={ label }
                        onChange={
                            (e: FormEvent<HTMLInputElement>, data: CheckboxProps) => handleActionOnClick(
                                onChange, e, data, id)
                        }
                        { ...actionsRest }
                    />
                )
            }
            case "checkbox": {
                return (
                    <Checkbox
                        label={ label }
                        onChange={
                            (e: FormEvent<HTMLInputElement>, data: CheckboxProps) => handleActionOnClick(
                                onChange, e, data, id)
                        }
                        { ...actionsRest }
                    />
                )
            }
            case "icon": {
                if (typeof icon === "string") {
                    return (
                        <Popup
                            disabled={ !popoverText }
                            trigger={ (
                                <div>
                                    <GenericIcon
                                        size="default"
                                        defaultIcon
                                        link
                                        inline
                                        transparent
                                        verticalAlign="middle"
                                        icon={ <Icon name={ icon as SemanticICONS } color="grey"/> }
                                        onClick={
                                            (e: MouseEvent<HTMLDivElement>) => handleActionOnClick(onClick, e, id)
                                        }
                                    />
                                </div>
                            ) }
                            position="top center"
                            content={ popoverText }
                            inverted
                        />
                    )
                }

                return (
                    <Popup
                        disabled={ !popoverText }
                        trigger={ (
                            <div>
                                <GenericIcon
                                    size="default"
                                    defaultIcon
                                    link
                                    inline
                                    transparent
                                    verticalAlign="middle"
                                    onClick={ (e: MouseEvent<HTMLDivElement>) => handleActionOnClick(onClick, e, id) }
                                    { ...icon }
                                />
                            </div>
                        ) }
                        position="top center"
                        content={ popoverText }
                        inverted
                    />
                )
            }
            default: {
                return null;
            }
        }
    };

    return (
        <Accordion.Title
            as={ Segment }
            attached={ attached && (active ? "top" : false) }
            active={ active }
            className={ classes }
            { ...rest }
        >
            <Grid>
                <Grid.Row>
                    <Grid.Column computer={ 8 } tablet={ 8 } mobile={ 16 } verticalAlign="middle">
                        { content || children }
                    </Grid.Column>
                    <Grid.Column computer={ 8 } tablet={ 8 } mobile={ 16 } verticalAlign="middle">
                        {
                            actions && actions instanceof Array && actions.length > 0 && (
                                <div className="flex floated right">
                                    {
                                        actions.map((action, index) => (
                                            <div
                                                key={ index }
                                                className="mr-3 m-auto"
                                                onClick={ (e: MouseEvent<HTMLDivElement>) => e.stopPropagation() }
                                            >
                                                { resolveAction(action) }
                                            </div>
                                        ))
                                    }
                                    <GenericIcon
                                        size="default"
                                        defaultIcon
                                        link
                                        inline
                                        transparent
                                        verticalAlign="middle"
                                        floated="right"
                                        icon={ <Icon name="angle right" className="chevron" /> }
                                    />
                                </div>
                            )
                        }
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Accordion.Title>
    );
};

SegmentedAccordionTitle.defaultProps = {
    attached: true,
    clearing: false
};
