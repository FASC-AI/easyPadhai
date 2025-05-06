class BannerModel {
  int? code;
  bool? status;
  String? message;
  BData? data;

  BannerModel({this.code, this.status, this.message, this.data});

  BannerModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new BData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class BData {
  List<Banners>? banners;
  int? count;

  BData({this.banners, this.count});

  BData.fromJson(Map<String, dynamic> json) {
    if (json['Banners'] != null) {
      banners = <Banners>[];
      json['Banners'].forEach((v) {
        banners!.add(new Banners.fromJson(v));
      });
    }
    count = json['count'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.banners != null) {
      data['Banners'] = this.banners!.map((v) => v.toJson()).toList();
    }
    data['count'] = this.count;
    return data;
  }
}

class Banners {
  String? sId;
  String? codee;
  String? bannersName;
  String? imageUrl;
  String? description;
  List<Images>? images;
  String? redirectPath;
  String? status;
  String? createdAt;
  String? updatedAt;
  int? iV;

  Banners(
      {this.sId,
      this.codee,
      this.bannersName,
      this.imageUrl,
      this.description,
      this.images,
      this.redirectPath,
      this.status,
      this.createdAt,
      this.updatedAt,
      this.iV});

  Banners.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    codee = json['codee'];
    bannersName = json['bannersName'];
    imageUrl = json['imageUrl'];
    description = json['description'];
    if (json['images'] != null) {
      images = <Images>[];
      json['images'].forEach((v) {
        images!.add(new Images.fromJson(v));
      });
    }
    redirectPath = json['redirectPath'];
    status = json['status'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
  }
   Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['codee'] = this.codee;
    data['bannersName'] = this.bannersName;
    data['imageUrl'] = this.imageUrl;
    data['description'] = this.description;
    if (this.images != null) {
      data['images'] = this.images!.map((v) => v.toJson()).toList();
    }
    data['redirectPath'] = this.redirectPath;
    data['status'] = this.status;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    return data;
  }
}

class Images {
  String? url;
  String? name;
  String? sId;

  Images({this.url, this.name, this.sId});

  Images.fromJson(Map<String, dynamic> json) {
    url = json['url'];
    name = json['name'];
    sId = json['_id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['url'] = this.url;
    data['name'] = this.name;
    data['_id'] = this.sId;
    return data;
  }
}
