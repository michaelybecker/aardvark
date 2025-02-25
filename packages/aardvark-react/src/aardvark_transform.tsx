import { AvNodeTransform, AvNodeType, AvQuaternion, EndpointAddr, MinimalPose, minimalToMat4Transform, nodeTransformFromMat4, quatFromAxisAngleDegrees, AvConstraint } from '@aardvarkxr/aardvark-shared';
import { vec3 } from '@tlaukkan/tsm';
import { AvBaseNode, AvBaseNodeProps } from './aardvark_base_node';


/** Props for {@link AvTransform} */
export interface AvTransformProps extends AvBaseNodeProps
{
	/** The uniform scale to apply to all children. If uniformScale is specified, 
	 * scaleX, scaleY, and scaleZ must be undefined.
	 * 
	 * @default 1.0
	 */
	uniformScale?:number;

	/** The scale on the X axis to apply to all children. Must be left undefined
	 * if uniformScale is specified.
	 * 
	 * @default 1.0
	 */
	scaleX?:number;

	/** The scale on the Y axis to apply to all children. Must be left undefined
	 * if uniformScale is specified.
	 * 
	 * @default 1.0
	 */
	scaleY?:number;

	/** The scale on the Z axis to apply to all children. Must be left undefined
	 * if uniformScale is specified.
	 * 
	 * @default 1.0
	 */
	scaleZ?:number;

	/** The translation on the X axis to apply to all children.
	 * 
	 * @default 0
	 */
	translateX?:number;

	/** The translation on the Y axis to apply to all children.
	 * 
	 * @default 0
	 */
	translateY?:number;

	/** The translation on the Z axis to apply to all children.
	 * 
	 * @default 0
	 */
	translateZ?:number;

	/** The rotation around the X axis (pitch) to apply to all children.
	 * If rotation is specified as a quaternio, this must be undefined.
	 * 
	 * @default 0
	 */
	rotateX?:number;

	/** The rotation around the Y axis (yaw) to apply to all children.
	 * If rotation is specified as a quaternio, this must be undefined.
	 * 
	 * @default 0
	 */
	rotateY?:number;

	/** The rotation around the Z axis (roll) to apply to all children.
	 * If rotation is specified as a quaternio, this must be undefined.
	 * 
	 * @default 0
	 */
	rotateZ?:number;

	/** The rotation to apply to all children, specified as a 
	 * quaternion.
	 * 
	 * @default none
	 */
	rotation?: AvQuaternion;

	/** Applies an already-constructed AvNodeTransform to the transform.
	 * If this prop is set, all other properties will replace the matching
	 * components of this transform.
	 * 
	 * @default none
	 */
	transform?: AvNodeTransform | MinimalPose;

	/** Sets the specified node as the parent of this transform. The endpoint
	 * address for the parent node can be in any gadget.
	 * 
	 * If the parent node is not valid, this node and its children will not 
	 * be traversed.
	 * 
	 * @default none
	 */
	parent?: EndpointAddr;

	/** Sets the constraint to apply to this node's transform before applying the
	 * parent transform. Using constraints without a parent may have unexpected results.
	 * 
	 * @default none
	 */
	constraint?: AvConstraint;
}

/** Applies a static transform to all children. */
export class AvTransform extends AvBaseNode< AvTransformProps, {} > 
{
	public buildNode()
	{
		let node = this.createNodeObject( AvNodeType.Transform, this.m_nodeId );

		if( Array.isArray( this.props.transform ) )
		{
			let seedTransform = nodeTransformFromMat4( 
				minimalToMat4Transform( this.props.transform as MinimalPose ) );
			node.propTransform = { ...seedTransform };
		}
		else if( this.props.transform )
		{
			node.propTransform = { ...this.props.transform };
		}
		else
		{
			node.propTransform = {};
		}

		if( this.props.uniformScale != null )
		{
			node.propTransform.scale = 
			{ 
				x: this.props.uniformScale, 
				y: this.props.uniformScale, 
				z: this.props.uniformScale, 
			};
		}
		else if( this.props.scaleX != null || this.props.scaleY != null || this.props.scaleZ != null )
		{
			node.propTransform.scale = 
			{ 
				x: this.props.scaleX != null ? this.props.scaleX : 1,
				y: this.props.scaleY != null ? this.props.scaleY : 1,
				z: this.props.scaleZ != null ? this.props.scaleZ : 1,
			};
		}

		if( this.props.translateX != null || this.props.translateY != null || this.props.translateZ != null )
		{
			node.propTransform.position =
			{
				x: this.props.translateX != null ? this.props.translateX : 0,
				y: this.props.translateY != null ? this.props.translateY : 0,
				z: this.props.translateZ != null ? this.props.translateZ : 0,
			}
		}
		if( this.props.rotation )
		{
			node.propTransform.rotation = this.props.rotation;
		}
		else if( this.props.rotateX != null || this.props.rotateY != null || this.props.rotateZ != null )
		{
			let qx = quatFromAxisAngleDegrees( vec3.right, this.props.rotateX );
			let qy = quatFromAxisAngleDegrees( vec3.up, this.props.rotateY );
			let qz = quatFromAxisAngleDegrees( vec3.forward, this.props.rotateZ );

			let q = qx.multiply( qy ).multiply( qz );
			node.propTransform.rotation =
			{
				w: q.w,
				x: q.x,
				y: q.y,
				z: q.z,
			}
		}

		node.propParentAddr = this.props.parent;
		node.propConstraint = this.props.constraint;

		return node;
	}
}