class ImageModel {
  bool? status;
  String? message;
  ImageModelData? data;

  ImageModel({this.status, this.message, this.data});

  ImageModel.fromJson(Map<String, dynamic> json) {
    status = json['status'];
    message = json['message'];
    data =
        json['data'] != null ? new ImageModelData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class ImageModelData {
  String? url;
  String? key;

  ImageModelData({this.url, this.key});

  ImageModelData.fromJson(Map<String, dynamic> json) {
    url = json['url'];
    key = json['key'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['url'] = this.url;
    data['key'] = this.key;
    return data;
  }
}
