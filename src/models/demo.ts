import mongoose, { Schema } from "mongoose";

const ProjectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    segment: { type: String, required: true },
    description: { type: String, required: true },
    health: { type: String, required: true },
  },
  { collection: "projects" },
);

const ProductInstanceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true, index: true },
    namespace: { type: String, required: true },
    productType: { type: String, required: true },
    name: { type: String, required: true },
    integrations: { type: Schema.Types.Mixed, required: true },
  },
  { collection: "product_instances" },
);

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String, required: true },
    projectRoles: { type: [Schema.Types.Mixed], required: true },
  },
  { collection: "users" },
);

const ConversationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true, index: true },
    productInstanceId: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, required: true },
    messages: { type: [Schema.Types.Mixed], required: true },
    updatedAt: { type: String, required: true },
  },
  { collection: "conversations" },
);

const DashboardConfigSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    projectId: { type: String, required: true, unique: true },
    updatedAt: { type: String, required: true },
    sections: { type: [Schema.Types.Mixed], required: true },
  },
  { collection: "dashboard_configs" },
);

export const ProjectModel =
  mongoose.models.Project ?? mongoose.model("Project", ProjectSchema);

export const ProductInstanceModel =
  mongoose.models.ProductInstance ??
  mongoose.model("ProductInstance", ProductInstanceSchema);

export const UserModel =
  mongoose.models.DemoUser ?? mongoose.model("DemoUser", UserSchema);

export const ConversationModel =
  mongoose.models.Conversation ??
  mongoose.model("Conversation", ConversationSchema);

export const DashboardConfigModel =
  mongoose.models.DashboardConfig ??
  mongoose.model("DashboardConfig", DashboardConfigSchema);
