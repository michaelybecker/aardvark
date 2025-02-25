import { AvVolume, EVolumeType, AvColor } from '@aardvarkxr/aardvark-shared';
import bind from 'bind-decorator';
import * as React from 'react';
import { ActiveInterface, AvInterfaceEntity } from './aardvark_interface_entity';
import { AvModel } from './aardvark_model';
import { PanelRequest, PanelRequestType } from './aardvark_panel';
import { AvTransform } from './aardvark_transform';


/** Props for {@link AvGrabButton} */
export interface GrabButtonProps
{
	/** The onTrigger callback is called when the grab button is grabbed. */
	onClick?: () => void;

	/** The onTrigger callback is called when the grab button is grabbed. */
	onRelease?: () => void;

	/** The URI of the GLTF model to use for this grab button. Exactly one
	 * of modelUri and radius must be specified. If modelUri is specified,
	 * the bounding box of the model will also be used as the grabbable
	 * region for the button.
	 */
	modelUri?: string;

	/** The color to apply to the model.
	 * 
	 * @default none
	 */
	color?: string | AvColor;

	/** The radius of the sphere that defines the grabbable handle for this 
	 * grab button. Exactly one of modelUri and radius must be specified.
	 */
	radius?: number;
}

interface GrabButtonState
{
	pokerCount: number;
}

/** A component that signals when it is grabbed. */
export class AvGrabButton extends React.Component< GrabButtonProps, GrabButtonState >
{
	constructor( props: any )
	{
		super( props );

		this.state = 
		{ 
			pokerCount: 0,
		};
	}

	@bind
	private onPanel( activePoker: ActiveInterface )
	{
		this.setState( ( prevState ) => { return { pokerCount: prevState.pokerCount + 1 }; } );
		activePoker.onEvent( ( event: PanelRequest ) =>
		{
			switch( event.type )
			{
				case PanelRequestType.Down:
					this.props.onClick?.();
					break;

				case PanelRequestType.Up:
					this.props.onRelease?.();
					break;
			}
		} );

		activePoker.onEnded( () =>
		{
			this.setState( ( prevState ) => { return { pokerCount: prevState.pokerCount - 1 }; } );
		} );
	}
	
	public render()
	{
		let scale = ( this.state.pokerCount > 0 ) ? 1.1 : 1.0;
		let volume: AvVolume;
		if( this.props.radius )
		{
			volume = 
			{
				type: EVolumeType.Sphere,
				radius: this.props.radius,
			};
		}
		else if( this.props.modelUri )
		{
			volume = 
			{
				type: EVolumeType.ModelBox,
				uri: this.props.modelUri,
			};
		}

		return <>
			<AvTransform uniformScale={ scale }>
				{ this.props.modelUri && <AvModel uri={ this.props.modelUri } 
					color={ this.props.color }/> }
				{ this.props.children }
			</AvTransform>
			<AvInterfaceEntity volume={ volume } priority={ 20 }
				receives={ [ { iface: "aardvark-panel@1", processor: this.onPanel } ] }/>
		</>;
	}
}

