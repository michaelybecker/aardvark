import * as React from 'react';
import { EndpointAddr, AvNodeTransform, endpointAddrToString, InitialInterfaceLock, endpointAddrsMatch } from '@aardvarkxr/aardvark-shared';
import { EntityComponent } from './aardvark_composed_entity';
import { InterfaceProp, ActiveInterface } from './aardvark_interface_entity';
import bind from 'bind-decorator';
import { AvTransform } from './aardvark_transform';
import { AvEntityChild } from './aardvark_entity_child';
import { ContainerRequestType, ContainerRequest, MoveableComponent } from './component_moveable';
import { AvGadget } from './aardvark_gadget';


export enum NetworkGadgetEventType
{
	SetGadgetInfo = "set_gadget_info",
	SendEventToAllRemotes = "send_event_to_remotes",
	ReceiveEventFromRemote = "receive_event_from_remote",
}

export interface NetworkGadgetEvent
{
	type: NetworkGadgetEventType;
}

export interface NGESetGadgetInfo extends NetworkGadgetEvent
{
	locks: InitialInterfaceLock[];
	url: string;
}

export interface NGESendEvent extends NetworkGadgetEvent
{
	event: object;
	reliable?: boolean;
}

export class NetworkedGadgetComponent implements EntityComponent
{
	private entityCallback: () => void = null;
	private networkProvider: ActiveInterface = null;
	private remoteGadgetInitalLocks: InitialInterfaceLock[] = null;
	private remoteEventCallback: ( event: object ) => void;

	constructor( remoteGadgetInitalLocks: InitialInterfaceLock[], remoteEventCallback: ( event: object ) => void )
	{
		this.remoteGadgetInitalLocks = remoteGadgetInitalLocks;
		this.remoteEventCallback = remoteEventCallback;
	}

	static readonly interfaceName= "aardvark-networked-gadget@1";

	private updateListener()
	{
		this.entityCallback?.();
	}

	public setInitialInterfaceLocks( remoteInterfaceLocks: InitialInterfaceLock[] )
	{
		this.remoteGadgetInitalLocks = remoteInterfaceLocks;
		this.sendSetGadgetInfo();
	}

	private sendSetGadgetInfo()
	{
		// tell the other end how we want to be started on the remote end
		let req: NGESetGadgetInfo =
		{
			type: NetworkGadgetEventType.SetGadgetInfo,
			locks: this.remoteGadgetInitalLocks,
			url: AvGadget.instance().url,
		};
		this.networkProvider?.sendEvent( req );
	}

	@bind
	private onNetworkedGadgetStart( networkProvider: ActiveInterface )
	{
		this.networkProvider = networkProvider;
		this.sendSetGadgetInfo();

		networkProvider.onEnded( ()=>
			{
				this.networkProvider = null;
			} );
		
		networkProvider.onEvent( ( event: NetworkGadgetEvent ) =>
		{
			switch( event.type )
			{
				case NetworkGadgetEventType.ReceiveEventFromRemote:
				{
					let remoteEvent = event as NGESendEvent;
					this.remoteEventCallback?.( remoteEvent.event );
				}
				break;
			}
		} );
	}

	public get transmits(): InterfaceProp[]
	{
		return [ { iface: NetworkedGadgetComponent.interfaceName, processor: this.onNetworkedGadgetStart } ];
	}

	public get receives(): InterfaceProp[]
	{
		return [];
	}

	public get parent(): EndpointAddr
	{
		return null;
	}
	
	public get wantsTransforms()
	{
		return false;
	}


	public get interfaceLocks(): InitialInterfaceLock[] { return []; }
	
	public onUpdate( callback: () => void ): void
	{
		this.entityCallback = callback;
	}


	public render(): JSX.Element
	{
		return null;
	}

	public sendEventToAllRemotes( event: object, reliable: boolean )
	{
		let evt: NGESendEvent =
		{
			type: NetworkGadgetEventType.SendEventToAllRemotes,
			event,
			reliable,
		};
		this.networkProvider?.sendEvent( evt );
	}
}

