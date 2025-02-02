/* eslint-disable @khanacademy/ts-no-error-suppressions */
import {
    components,
    icons,
    Widgets,
    WIDGET_PROP_DENYLIST,
} from "@khanacademy/perseus";
import * as React from "react";
import _ from "underscore";

import SectionControlButton from "./section-control-button";

import type {Alignment, WidgetInfo} from "@khanacademy/perseus";

const {InlineIcon, PropCheckBox} = components;
const {iconChevronDown, iconChevronRight, iconTrash} = icons;

type WidgetEditorProps = {
    // Unserialized props
    id: string;
    onChange: (
        widgetInfo: WidgetInfo,
        cb?: () => unknown,
        silent?: boolean,
    ) => unknown;
    onRemove: () => unknown;
    apiOptions: any;
} & WidgetInfo;

type WidgetEditorState = {
    showWidget: boolean;
    widgetInfo: WidgetInfo;
};

const _upgradeWidgetInfo = (props: WidgetEditorProps): React.ReactElement => {
    // We can't call serialize here because this.refs.widget
    // doesn't exist before this component is mounted.
    const filteredProps = _.omit(props, WIDGET_PROP_DENYLIST);
    // @ts-expect-error - TS2322 - Type 'PerseusWidget' is not assignable to type 'ReactElement<any, string | JSXElementConstructor<any>>'. | TS2345 - Argument of type 'Partial<{ id: string; onChange: (widgetInfo: PerseusWidget, cb?: (() => unknown) | undefined, silent?: boolean | undefined) => unknown; onRemove: () => unknown; apiOptions: any; } & CategorizerWidget & { ...; }> | ... 38 more ... | Partial<...>' is not assignable to parameter of type 'PerseusWidget'.
    return Widgets.upgradeWidgetInfoToLatestVersion(filteredProps);
};

// This component handles upgading widget editor props via prop
// upgrade transforms. Widget editors will always be rendered
// with all available transforms applied, but the results of those
// transforms will not be propogated upwards until serialization.
// eslint-disable-next-line react/no-unsafe
class WidgetEditor extends React.Component<
    WidgetEditorProps,
    WidgetEditorState
> {
    constructor(props: WidgetEditorProps) {
        super(props);
        this.state = {
            showWidget: false,
            // @ts-expect-error - TS2322 - Type 'ReactElement<any, any> | null' is not assignable to type 'PerseusWidget'.
            widgetInfo: _upgradeWidgetInfo(props),
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps: WidgetEditorProps) {
        // @ts-expect-error - TS2322 - Type 'ReactElement<any, any> | null' is not assignable to type 'PerseusWidget'.
        this.setState({widgetInfo: _upgradeWidgetInfo(nextProps)});
    }

    _toggleWidget = (e: React.SyntheticEvent) => {
        e.preventDefault();
        this.setState({showWidget: !this.state.showWidget});
    };

    _handleWidgetChange = (
        newProps: WidgetEditorProps,
        cb: () => unknown,
        silent: boolean,
    ) => {
        const newWidgetInfo = Object.assign(
            {},
            this.state.widgetInfo,
        ) as WidgetInfo;
        newWidgetInfo.options = Object.assign(
            // eslint-disable-next-line react/no-string-refs
            // @ts-expect-error - TS2339 - Property 'serialize' does not exist on type 'ReactInstance'.
            this.refs.widget.serialize(),
            newProps,
        );
        this.props.onChange(newWidgetInfo, cb, silent);
    };

    _toggleStatic = (e: Event) => {
        e.preventDefault();
        const newWidgetInfo = Object.assign({}, this.state.widgetInfo, {
            static: !this.state.widgetInfo.static,
        }) as WidgetInfo;
        this.props.onChange(newWidgetInfo);
    };

    _handleAlignmentChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
        const newAlignment = e.currentTarget.value as Alignment;
        const newWidgetInfo = Object.assign(
            {},
            this.state.widgetInfo,
        ) as WidgetInfo;
        newWidgetInfo.alignment = newAlignment;
        this.props.onChange(newWidgetInfo);
    };

    getSaveWarnings = () => {
        // eslint-disable-next-line react/no-string-refs
        // @ts-expect-error - TS2339 - Property 'getSaveWarnings' does not exist on type 'ReactInstance'.
        const issuesFunc = this.refs.widget.getSaveWarnings;
        return issuesFunc ? issuesFunc() : [];
    };

    serialize = () => {
        // TODO(alex): Make this properly handle the case where we load json
        // with a more recent widget version than this instance of Perseus
        // knows how to handle.
        const widgetInfo = this.state.widgetInfo;
        return {
            type: widgetInfo.type,
            alignment: widgetInfo.alignment,
            static: widgetInfo.static,
            graded: widgetInfo.graded,
            // eslint-disable-next-line react/no-string-refs
            // @ts-expect-error - TS2339 - Property 'serialize' does not exist on type 'ReactInstance'.
            options: this.refs.widget.serialize(),
            version: widgetInfo.version,
        };
    };

    render(): React.ReactNode {
        const widgetInfo = this.state.widgetInfo;

        const Ed = Widgets.getEditor(widgetInfo.type);
        let supportedAlignments: ReadonlyArray<Alignment>;
        if (this.props.apiOptions.showAlignmentOptions) {
            supportedAlignments = Widgets.getSupportedAlignments(
                widgetInfo.type,
            );
        } else {
            // NOTE(kevinb): "default" is not one in `validAlignments` in widgets.js.
            supportedAlignments = ["default"];
        }

        const supportsStaticMode = Widgets.supportsStaticMode(widgetInfo.type);

        const isUngradedEnabled = widgetInfo.type === "transformer";
        const gradedPropBox = (
            <PropCheckBox
                label="Graded:"
                graded={widgetInfo.graded}
                onChange={this.props.onChange}
            />
        );

        return (
            <div className="perseus-widget-editor">
                <div
                    className={
                        "perseus-widget-editor-title " +
                        (this.state.showWidget ? "open" : "closed")
                    }
                >
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a
                        className="perseus-widget-editor-title-id"
                        href="#"
                        onClick={this._toggleWidget}
                    >
                        {this.props.id}
                        {this.state.showWidget ? (
                            <InlineIcon {...iconChevronDown} />
                        ) : (
                            <InlineIcon {...iconChevronRight} />
                        )}
                    </a>

                    {supportsStaticMode && (
                        <input
                            type="button"
                            // @ts-expect-error - TS2322 - Type '(e: Event) => void' is not assignable to type 'MouseEventHandler<HTMLInputElement>'.
                            onClick={this._toggleStatic}
                            className="simple-button--small"
                            value={
                                widgetInfo.static
                                    ? "Unset as static"
                                    : "Set as static"
                            }
                        />
                    )}
                    {supportedAlignments.length > 1 && (
                        <select
                            className="alignment"
                            value={widgetInfo.alignment}
                            onChange={this._handleAlignmentChange}
                        >
                            {supportedAlignments.map((alignment) => (
                                <option key={alignment}>{alignment}</option>
                            ))}
                        </select>
                    )}
                    <SectionControlButton
                        icon={iconTrash}
                        onClick={() => {
                            this.props.onRemove();
                        }}
                        title="Remove image widget"
                    />
                </div>
                <div
                    className={
                        "perseus-widget-editor-content " +
                        (this.state.showWidget ? "enter" : "leave")
                    }
                >
                    {isUngradedEnabled && gradedPropBox}
                    {Ed && (
                        <Ed
                            // eslint-disable-next-line react/no-string-refs
                            ref="widget"
                            onChange={this._handleWidgetChange}
                            static={widgetInfo.static}
                            apiOptions={this.props.apiOptions}
                            {...widgetInfo.options}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default WidgetEditor;
